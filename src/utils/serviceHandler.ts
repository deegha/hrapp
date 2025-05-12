import { getAuthToken } from "@/utils/getAuthToken";

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

  const data = await response.json();
  return data as TResponse;
};
