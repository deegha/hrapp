import {useAuthStore} from "@/store/authstore";
import {getAuthToken} from "@/utils/getAuthToken";

interface IFetchApi<TBody> {
  method: "POST" | "GET" | "PUT" | "DELETE";
  baseURL: string;
  resource: string;
  body?: TBody;
  protectedRoute?: boolean;
}

export const serviceHandler = async <TResponse, TBody = undefined>({
  method,
  body,
  baseURL,
  resource,
  protectedRoute = true,
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
  const response = await fetch(url, {
    headers,
    method,
    body: body ? JSON.stringify(body) : undefined,
  });

  // Handle token expiration smoothly
  if (response.status === 401 && protectedRoute) {
    // Clean up store and localStorage
    useAuthStore.getState().logout();

    // Only redirect if not already on login page
    if (!window.location.pathname.includes("/login")) {
      window.location.href = "/login";
    }
    throw new Error("Session expired");
  }

  const data = await response.json();

  // Check if response indicates an error
  if (data.error === true) {
    throw data.data; // Throw the error message
  }

  return data as TResponse;
};
