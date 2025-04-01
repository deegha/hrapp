import { serviceHandler } from "@/utils/serviceHandler";
import { User } from "@/types/user";

export type TLoginApiResponse = {
  error: boolean;
  data: {
    user: User;
    token: string;
  };
};

type TLoginBody = {
  user: {
    email: string;
    password: string;
  };
};

export async function loginServiceCall(email: string, password: string) {
  const response = await serviceHandler<TLoginApiResponse, TLoginBody>({
    method: "POST",
    body: {
      user: {
        email: email,
        password: password,
      },
    },
    baseURL: process.env.NEXT_PUBLIC_API as string,
    resource: "authenticate",
    protectedRoute: false,
  });

  return response;
}

type TLogOutApiResponse = {
  error: boolean;
  data: string;
};

export async function logOutServiceCall() {
  await serviceHandler<TLogOutApiResponse>({
    method: "POST",
    baseURL: process.env.NEXT_PUBLIC_API as string,
    resource: "logout",
  });
}
