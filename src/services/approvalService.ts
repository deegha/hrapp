import {serviceHandler} from "@/utils/serviceHandler";
import {
  TResponseWithPagination,
  TApproval,
  TGenericFilters,
  TResponse,
  LeaveRequest,
} from "@/types/";

export function approvalService(filters: TGenericFilters) {
  const limit = filters.limit;
  const page = filters.page;

  const response = serviceHandler<TResponseWithPagination<TApproval[]>>({
    method: "GET",
    baseURL: process.env.NEXT_PUBLIC_API as string,
    resource: `approval?page=${page}&limit=${limit}`,
  });

  return response;
}

type TApprove = {
  approvalRequestId: number;
  itemId: number;
  approveReject: "APPROVED" | "REJECTED";
  rejectedReason?: string;
};

export function approveRequest(
  type: "USER" | "LEAVEREQUEST" | "DEPARTMENT_ASSIGNMENT",
  {approvalRequestId, itemId, approveReject, rejectedReason}: TApprove,
) {
  let resource: string;
  let requestBody: {
    approvalRequestId: number;
    itemId?: number;
    approveReject: string;
    rejectedReason?: string;
  } = {
    approvalRequestId,
    itemId,
    approveReject,
    rejectedReason,
  };

  if (type === "LEAVEREQUEST") {
    resource = `leave-approval`;
  } else if (type === "DEPARTMENT_ASSIGNMENT") {
    resource = `user/approve-department-assignment`;
    requestBody = {
      approvalRequestId,
      approveReject,
    };
  } else {
    resource = `user-approval`;
  }

  const response = serviceHandler<TResponse<LeaveRequest>, typeof requestBody>({
    method: "PUT",
    baseURL: process.env.NEXT_PUBLIC_API as string,
    body: requestBody,
    resource: resource,
  });

  return response;
}
