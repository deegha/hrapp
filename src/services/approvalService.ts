import { serviceHandler } from "@/utils/serviceHandler";
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
};

export function approveRequest(
  type: "USER" | "LEAVEREQUEST",
  { approvalRequestId, itemId }: TApprove
) {
  const resource = type === "LEAVEREQUEST" ? `leave-approval` : `user-approval`;

  const response = serviceHandler<TResponse<LeaveRequest>, TApprove>({
    method: "PUT",
    baseURL: process.env.NEXT_PUBLIC_API as string,
    body: {
      approvalRequestId,
      itemId,
    },
    resource: resource,
  });

  return response;
}
