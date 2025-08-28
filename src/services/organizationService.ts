import {serviceHandler} from "@/utils/serviceHandler";
import {TResponse} from "@/types";
import {
  TLeaveType,
  TLeavePolicy,
  TUpdateLeavePolicyPayload,
  TCreateLeaveTypePayload,
  TEmploymentType,
  TCreateEmploymentTypePayload,
  TDepartment,
  TCreateDepartmentPayload,
  TUpdateDepartmentPayload,
} from "@/types/organization";

export async function fetchLeaveTypes() {
  return await serviceHandler<TResponse<TLeaveType[]>>({
    method: "GET",
    baseURL: process.env.NEXT_PUBLIC_API as string,
    resource: "organization/leave-types",
  });
}

export async function fetchLeavePolicies() {
  return await serviceHandler<TResponse<TLeavePolicy[]>>({
    method: "GET",
    baseURL: process.env.NEXT_PUBLIC_API as string,
    resource: "organization/leave-policies",
  });
}

export async function updateLeavePolicy(policy: TUpdateLeavePolicyPayload) {
  return await serviceHandler<TResponse<TLeavePolicy>, TUpdateLeavePolicyPayload>({
    method: "PUT",
    body: policy,
    baseURL: process.env.NEXT_PUBLIC_API as string,
    resource: "organization/leave-policy",
  });
}

export async function createLeaveType(leaveType: TCreateLeaveTypePayload) {
  return await serviceHandler<TResponse<TLeavePolicy>, TCreateLeaveTypePayload>({
    method: "POST",
    body: leaveType,
    baseURL: process.env.NEXT_PUBLIC_API as string,
    resource: "organization/leave-type",
  });
}

export async function deleteLeaveType(leaveTypeId: number) {
  return await serviceHandler<TResponse<{message: string}>, {leaveTypeId: number}>({
    method: "DELETE",
    body: {leaveTypeId},
    baseURL: process.env.NEXT_PUBLIC_API as string,
    resource: "organization/leave-type",
  });
}

export async function fetchEmploymentTypes() {
  return await serviceHandler<TResponse<TEmploymentType[]>>({
    method: "GET",
    baseURL: process.env.NEXT_PUBLIC_API as string,
    resource: "organization/employment-types",
  });
}

export async function createEmploymentType(employmentType: TCreateEmploymentTypePayload) {
  return await serviceHandler<TResponse<TEmploymentType>, TCreateEmploymentTypePayload>({
    method: "POST",
    body: employmentType,
    baseURL: process.env.NEXT_PUBLIC_API as string,
    resource: "organization/employment-types",
  });
}

export async function deleteEmploymentType(id: number) {
  return await serviceHandler<TResponse<{message: string}>>({
    method: "DELETE",
    baseURL: process.env.NEXT_PUBLIC_API as string,
    resource: `organization/employment-types/${id}`,
  });
}

export async function fetchDepartments() {
  return await serviceHandler<TResponse<TDepartment[]>>({
    method: "GET",
    baseURL: process.env.NEXT_PUBLIC_API as string,
    resource: "organization/departments",
  });
}

export async function createDepartment(department: TCreateDepartmentPayload) {
  return await serviceHandler<TResponse<TDepartment>, TCreateDepartmentPayload>({
    method: "POST",
    body: department,
    baseURL: process.env.NEXT_PUBLIC_API as string,
    resource: "organization/departments",
  });
}

export async function updateDepartment(id: number, department: TUpdateDepartmentPayload) {
  return await serviceHandler<TResponse<TDepartment>, TUpdateDepartmentPayload>({
    method: "PUT",
    body: department,
    baseURL: process.env.NEXT_PUBLIC_API as string,
    resource: `organization/departments/${id}`,
  });
}

export async function deleteDepartment(id: number) {
  return await serviceHandler<TResponse<{message: string}>>({
    method: "DELETE",
    baseURL: process.env.NEXT_PUBLIC_API as string,
    resource: `organization/departments/${id}`,
  });
}
