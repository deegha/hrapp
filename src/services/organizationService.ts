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
  TOrganizationLocationSettingsPayload,
  TOrganizationLocationSettings,
} from "@/types/organization";

export type THoliday = {
  id: number;
  name: string;
  date: string;
  description: string | null;
  type: string;
  organizationId: number;
  createdAt: string;
};

export type TCreateHolidayPayload = {
  name: string;
  date: string;
  description?: string;
};

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

export async function saveTargetLocation(coords: {lat: number; lng: number}, currentZoom?: number) {
  return await serviceHandler<
    TResponse<TOrganizationLocationSettings>,
    TOrganizationLocationSettingsPayload
  >({
    method: "POST",
    body: {
      centerLat: coords.lat,
      centerLon: coords.lng,
      radiusMeters: 500,
      officeName: "Headquarters",
      currentZoom: currentZoom || 7,
    },
    baseURL: process.env.NEXT_PUBLIC_API as string,
    resource: "organization/update-location",
  });
}

export async function fetchOrganizationLocationSettings() {
  const response = await serviceHandler<TResponse<TOrganizationLocationSettings>>({
    method: "GET",
    baseURL: process.env.NEXT_PUBLIC_API as string,
    resource: "organization/office-location",
  });

  const data = {
    ...response,
    data: {
      ...response.data,
      centerLat: parseFloat(response.data.centerLat),
      centerLon: parseFloat(response.data.centerLon),
      currentZoom: response.data.currentZoom || 7,
    },
  };

  return data;
}

export async function fetchHolidays() {
  return await serviceHandler<TResponse<THoliday[]>>({
    method: "GET",
    baseURL: process.env.NEXT_PUBLIC_API as string,
    resource: "organization/holidays",
  });
}

export async function createHoliday(holiday: TCreateHolidayPayload) {
  return await serviceHandler<TResponse<THoliday>, TCreateHolidayPayload>({
    method: "POST",
    body: holiday,
    baseURL: process.env.NEXT_PUBLIC_API as string,
    resource: "organization/holidays",
  });
}

export async function deleteHoliday(id: number) {
  return await serviceHandler<TResponse<{message: string}>>({
    method: "DELETE",
    baseURL: process.env.NEXT_PUBLIC_API as string,
    resource: `organization/holidays/${id}`,
  });
}
