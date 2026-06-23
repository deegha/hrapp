import {serviceHandler} from "@/utils/serviceHandler";

type TOpsAdminUser = {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  userRole?: string;
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

async function adminFetch<T>(resource: string, method = "GET", body?: unknown): Promise<T> {
  const token = localStorage.getItem("admin_token");
  const url = `${process.env.NEXT_PUBLIC_API}${resource}`;

  const response = await fetch(url, {
    method,
    headers: {
      "Content-Type": "application/json",
      authorization: `Bearer ${token}`,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (response.status === 401) {
    localStorage.removeItem("admin_token");
    localStorage.removeItem("admin_user");
    window.location.href = "/admin-panel/login";
    throw new Error("Session expired");
  }

  return response.json();
}

export type TAdminOrganization = {
  id: number;
  organizationName: string;
  activeUserCount: number;
};

export type TAdminUser = {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  employeeId: number | null;
  isManager: boolean;
  UserStatus: {id: number; statusLabel: string} | null;
  EmploymentType: {id: number; typeLabel: string} | null;
  Department: {id: number; departmentName: string} | null;
  manager: {id: number; firstName: string; lastName: string; email: string} | null;
};

export type TOrgFeatures = {
  isAttendanceEnabled: boolean;
  isGeofenceRequired: boolean;
  isQrCodeCheckEnabled: boolean;
  isSelfieVerificationEnabled: boolean;
  isAdvanceLeaveEnabled: boolean;
  isTimeOffRequestsEnabled: boolean;
};

export type TAdminOrganizationDetail = {
  error: boolean;
  data: {
    organization: {id: number; organizationName: string};
    features: TOrgFeatures;
    users: TAdminUser[];
  };
};

export async function fetchAdminOrganizations() {
  return adminFetch<{error: boolean; data: TAdminOrganization[]}>("admin/organizations");
}

export async function fetchAdminOrganizationUsers(orgId: number) {
  return adminFetch<TAdminOrganizationDetail>(`admin/organizations/${orgId}/users`);
}

export async function updateAdminOrgFeatures(orgId: number, features: Partial<TOrgFeatures>) {
  return adminFetch<{error: boolean; data: TOrgFeatures}>(
    `admin/organizations/${orgId}/features`,
    "PUT",
    features,
  );
}

export type TInternalUser = {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  createdAt: string;
};

type TApiResponse<T> = {error: boolean; data: T};

export async function fetchInternalUsers() {
  return adminFetch<TApiResponse<TInternalUser[]>>("admin/internal-users");
}

export type TCreateInternalUserPayload = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
};

export async function createInternalUser(payload: TCreateInternalUserPayload) {
  return adminFetch<TApiResponse<TInternalUser>>("admin/internal-users", "POST", payload);
}

export type TUpdateInternalUserPayload = {
  firstName: string;
  lastName: string;
  email: string;
  password?: string;
};

export async function updateInternalUser(id: number, payload: TUpdateInternalUserPayload) {
  return adminFetch<TApiResponse<TInternalUser>>(`admin/internal-users/${id}`, "PUT", payload);
}

export async function deleteInternalUser(id: number) {
  return adminFetch<TApiResponse<string>>(`admin/internal-users/${id}`, "DELETE");
}

export type TMyProfile = {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  createdAt: string;
};

export async function fetchMyAdminProfile() {
  return adminFetch<TApiResponse<TMyProfile>>("admin/me");
}

export type TUpdateMyProfilePayload = {firstName: string; lastName: string; email: string};

export async function updateMyAdminProfile(payload: TUpdateMyProfilePayload) {
  return adminFetch<TApiResponse<TMyProfile>>("admin/me", "PUT", payload);
}

export type TChangePasswordPayload = {currentPassword: string; newPassword: string};

export async function changeAdminPassword(payload: TChangePasswordPayload) {
  return adminFetch<TApiResponse<string>>("admin/me/password", "PUT", payload);
}
