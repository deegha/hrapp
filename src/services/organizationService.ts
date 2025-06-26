import {serviceHandler} from "@/utils/serviceHandler";
import {TResponse} from "@/types";
import {
  TLeaveType,
  TLeavePolicy,
  TUpdateLeavePolicyPayload,
  TCreateLeaveTypePayload,
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
