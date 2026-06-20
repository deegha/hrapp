import {serviceHandler} from "@/utils/serviceHandler";

type TOpsAdminUser = {
  firstName: string;
  lastName: string;
  email: string;
  userRole: string;
};

export type TAdminLoginResponse = {
  error: boolean;
  data: {
    user: TOpsAdminUser;
    token: string;
  };
};

type TAdminLoginBody = {
  user: {
    email: string;
    password: string;
  };
};

export async function adminLoginServiceCall(email: string, password: string) {
  return serviceHandler<TAdminLoginResponse, TAdminLoginBody>({
    method: "POST",
    body: {user: {email, password}},
    baseURL: process.env.NEXT_PUBLIC_API as string,
    resource: "admin/authenticate",
    protectedRoute: false,
  });
}

export type TAdminCheckAuthResponse = {
  error: boolean;
  data: string;
};

export async function adminCheckAuthServiceCall() {
  const token = localStorage.getItem("admin_token");
  const url = `${process.env.NEXT_PUBLIC_API}admin/checkAuth`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();
  return data as TAdminCheckAuthResponse;
}
