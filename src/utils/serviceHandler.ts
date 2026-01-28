import {useAuthStore} from "@/store/authstore";
import {getAuthToken} from "@/utils/getAuthToken";

interface IFetchApi<TBody> {
  method: "POST" | "GET" | "PUT" | "DELETE";
  baseURL: string;
  resource: string;
  body?: TBody;
  protectedRoute?: boolean;
  responseType?: "json" | "blob";
}

export const serviceHandler = async <TResponse, TBody = undefined>({
  method,
  body,
  baseURL,
  resource,
  protectedRoute = true,
  responseType = "json", // Default to json
}: IFetchApi<TBody>): Promise<TResponse> => {
  const url = baseURL + resource;

  let headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (protectedRoute) {
    headers = {
      ...headers,
      authorization: `Bearer ${getAuthToken()}`,
    };
  }

  if (responseType === "blob") {
    headers = {
      ...headers,
      Accept: "application/octet-stream",
    };
  }

  const response = await fetch(url, {
    headers,
    method,
    body: body ? JSON.stringify(body) : undefined,
  });

  // Handle token expiration smoothly
  if (response.status === 401 && protectedRoute) {
    useAuthStore.getState().logout();
    if (!window.location.pathname.includes("/login")) {
      window.location.href = "/login";
    }
    throw new Error("Session expired");
  }

  // 1. If it's a blob, return it directly after checking for errors
  if (responseType === "blob") {
    if (!response.ok) {
      // If the file download fails, the server might send a JSON error
      // We try to parse it to show a meaningful error message
      const errorText = await response.text();
      try {
        const errorJson = JSON.parse(errorText);
        throw new Error(errorJson.data || "Failed to download file");
      } catch {
        throw new Error("Failed to download file");
      }
    }
    return (await response.blob()) as unknown as TResponse;
  }

  // 2. Default JSON handling
  const data = await response.json();

  if (data.error === true) {
    throw data.data;
  }

  return data as TResponse;
};
