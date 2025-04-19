import { serviceHandler } from "@/utils/serviceHandler";

export type ApiResponse = {
  error: boolean;
  data: string;
};

export function checkAuthServiceCall() {
  const response = serviceHandler<ApiResponse>({
    method: "POST",
    baseURL: process.env.NEXT_PUBLIC_API as string,
    resource: "checkAuth",
  });

  console.log(response);

  return response;
}
