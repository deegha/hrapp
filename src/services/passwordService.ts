import {serviceHandler} from "@/utils/serviceHandler";
import {TResponse} from "@/types";

export async function forgotPasswordService(email: string) {
  return await serviceHandler<TResponse<string>, {email: string}>({
    method: "POST",
    body: {email},
    baseURL: process.env.NEXT_PUBLIC_API as string,
    resource: "forgot-password",
    protectedRoute: false,
  });
}

export async function resetPasswordService(token: string, password: string) {
  return await serviceHandler<TResponse<string>, {token: string; password: string}>({
    method: "POST",
    body: {token, password},
    baseURL: process.env.NEXT_PUBLIC_API as string,
    resource: "reset-password",
    protectedRoute: false,
  });
}
