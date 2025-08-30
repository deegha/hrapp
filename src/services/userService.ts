import {serviceHandler} from "@/utils/serviceHandler";
import {
  TUser,
  TUserStatus,
  TUserPermission,
  TCreateUser,
  TAllUserDetails,
  TUpdateUser,
  IUserSearchResult,
} from "@/types/user";
import {TResponse, TGenericFilters, TApproval} from "@/types";
import {TResponseWithPagination} from "@/types/api";
import {downloadWithAuth} from "@/utils/download";

export type TLoginApiResponse = {
  error: boolean;
  data: {
    user: TUser;
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
  return await serviceHandler<TLogOutApiResponse>({
    method: "POST",
    baseURL: process.env.NEXT_PUBLIC_API as string,
    resource: "logout",
  });
}

export async function fetchUserStatus() {
  return serviceHandler<TResponse<TUserStatus[]>>({
    method: "GET",
    baseURL: process.env.NEXT_PUBLIC_API as string,
    resource: "userStatus",
  });
}

export async function fetchPermission() {
  return serviceHandler<TResponse<TUserPermission[]>>({
    method: "GET",
    baseURL: process.env.NEXT_PUBLIC_API as string,
    resource: "permission",
  });
}

export async function createUserService(user: TCreateUser) {
  const response = await serviceHandler<TResponse<TUser>, TCreateUser>({
    method: "POST",
    body: user,
    baseURL: process.env.NEXT_PUBLIC_API as string,
    resource: "user",
  });

  return response;
}

export async function fetchUsers({page, limit}: TGenericFilters) {
  return serviceHandler<TResponseWithPagination<TUser[]>>({
    method: "GET",
    baseURL: process.env.NEXT_PUBLIC_API as string,
    resource: `user?page=${page}&limit=${limit}`,
  });
}

export async function fetchUser(empId: string) {
  return serviceHandler<TResponse<TAllUserDetails>>({
    method: "GET",
    baseURL: process.env.NEXT_PUBLIC_API as string,
    resource: `user/${empId}`,
  });
}

export async function deleteUser(empId: number) {
  return serviceHandler<TResponse<TAllUserDetails>, {userId: number}>({
    method: "DELETE",
    baseURL: process.env.NEXT_PUBLIC_API as string,
    resource: `user`,
    body: {
      userId: empId,
    },
  });
}

export async function updateMyProfile(user: TUpdateUser) {
  return serviceHandler<TResponse<TAllUserDetails>, TUpdateUser>({
    method: "PUT",
    baseURL: process.env.NEXT_PUBLIC_API as string,
    resource: `my-profile`,
    body: user,
  });
}

export async function fetchMyPermissions() {
  return serviceHandler<TResponse<{permission: string | null}>>({
    method: "GET",
    baseURL: process.env.NEXT_PUBLIC_API as string,
    resource: "my-permission",
  });
}

export async function fetchEmploymentTypes() {
  return serviceHandler<TResponse<{id: number; typeLabel: string}[]>>({
    method: "GET",
    baseURL: process.env.NEXT_PUBLIC_API as string,
    resource: "employment-types",
  });
}

export async function updateEmploymentType(employeeId: number, newEmploymentTypeId: number) {
  return serviceHandler<
    TResponse<{message: string}>,
    {employeeId: number; newEmploymentTypeId: number}
  >({
    method: "PUT",
    baseURL: process.env.NEXT_PUBLIC_API as string,
    resource: "user/employment-type",
    body: {
      employeeId,
      newEmploymentTypeId,
    },
  });
}

export async function searchUserService(searchTerm: string) {
  return serviceHandler<TResponse<IUserSearchResult[]>>({
    method: "GET",
    baseURL: process.env.NEXT_PUBLIC_API as string,
    resource: `user/search/${searchTerm}`,
  });
}

export async function assignManager(employeeId: number, managerId: number | null) {
  return serviceHandler<TResponse<TAllUserDetails>, {managerId: number | null}>({
    method: "PUT",
    baseURL: process.env.NEXT_PUBLIC_API as string,
    resource: `user/${employeeId}/assign-manager`,
    body: {
      managerId,
    },
  });
}

export async function assignDepartmentToUser(employeeId: number, departmentId: number | null) {
  if (departmentId === null) {
    // Remove department assignment
    return serviceHandler<TResponse<{message: string}>, {employeeId: number}>({
      method: "DELETE",
      baseURL: process.env.NEXT_PUBLIC_API as string,
      resource: "user/remove-department",
      body: {
        employeeId,
      },
    });
  }

  return serviceHandler<TResponse<{message: string}>, {employeeId: number; departmentId: number}>({
    method: "PUT",
    baseURL: process.env.NEXT_PUBLIC_API as string,
    resource: "user/assign-department",
    body: {
      employeeId,
      departmentId,
    },
  });
}

export async function requestDepartmentAssignmentForUser(employeeId: number, departmentId: number) {
  return serviceHandler<
    TResponse<{message: string; approvalId: number}>,
    {employeeId: number; departmentId: number}
  >({
    method: "POST",
    baseURL: process.env.NEXT_PUBLIC_API as string,
    resource: "user/request-department-assignment",
    body: {
      employeeId,
      departmentId,
    },
  });
}

export async function requestDepartmentRemovalForUser(employeeId: number) {
  return serviceHandler<TResponse<{message: string; approvalId: number}>, {employeeId: number}>({
    method: "POST",
    baseURL: process.env.NEXT_PUBLIC_API as string,
    resource: "user/request-department-removal",
    body: {
      employeeId,
    },
  });
}

export async function fetchUserPendingApprovals(userId: number) {
  return serviceHandler<TResponse<TApproval[]>>({
    method: "GET",
    baseURL: process.env.NEXT_PUBLIC_API as string,
    resource: `user/${userId}/pending-approvals`,
  });
}

export async function addUserDocument(employeeId: number, title: string, url: string) {
  return serviceHandler<
    TResponse<{id: number; title: string; fileUrl: string; createdAt: string}>,
    {title: string; url: string}
  >({
    method: "POST",
    baseURL: process.env.NEXT_PUBLIC_API as string,
    resource: `user/${employeeId}/documents`,
    body: {
      title,
      url,
    },
  });
}

export async function deleteUserDocument(employeeId: number, documentId: number) {
  return serviceHandler<TResponse<{success: boolean}>>({
    method: "DELETE",
    baseURL: process.env.NEXT_PUBLIC_API as string,
    resource: `user/${employeeId}/documents/${documentId}`,
  });
}

export async function createMyDocument(title: string, url: string) {
  return serviceHandler<
    TResponse<{id: number; title: string; fileUrl: string; createdAt: string}>,
    {title: string; url: string}
  >({
    method: "POST",
    baseURL: process.env.NEXT_PUBLIC_API as string,
    resource: "my-documents",
    body: {
      title,
      url,
    },
  });
}

export async function deleteMyDocument(documentId: number) {
  return serviceHandler<TResponse<{success: boolean}>>({
    method: "DELETE",
    baseURL: process.env.NEXT_PUBLIC_API as string,
    resource: `my-documents/${documentId}`,
  });
}

// Downloads
export async function downloadEmployeeDocument(
  employeeId: number,
  documentId: number,
  filename?: string,
) {
  return downloadWithAuth(`user/${employeeId}/documents/${documentId}/download`, filename);
}

export async function downloadMyDocument(documentId: number, filename?: string) {
  return downloadWithAuth(`my-documents/${documentId}/download`, filename);
}
