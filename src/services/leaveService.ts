import { serviceHandler } from "@/utils/serviceHandler";
import {
  TLeaves,
  LeaveRequest,
  TResponse,
  TGenericFilters,
  TResponseWithPagination,
} from "@/types";

type TCreateLeaveRequestResponse = {
  error: boolean;
  data: string;
};

type TCreateLeaveRequestPayload = {
  leaves: Array<TLeaves>;
  documents?: Array<string>;
  note?: string;
};

export async function createLeaveRequest(payload: TCreateLeaveRequestPayload) {
  return await serviceHandler<
    TCreateLeaveRequestResponse,
    TCreateLeaveRequestPayload
  >({
    method: "POST",
    body: payload,
    baseURL: process.env.NEXT_PUBLIC_API as string,
    resource: "leave",
  });
}

export async function fetchLeave({ page, limit }: TGenericFilters) {
  return await serviceHandler<TResponseWithPagination<LeaveRequest[]>>({
    method: "GET",
    baseURL: process.env.NEXT_PUBLIC_API as string,
    resource: `leave?page=${page}&limit=${limit}`,
  });
}

export async function fetchLeaveRequest(id: string) {
  return await serviceHandler<TResponse<LeaveRequest>>({
    method: "GET",
    baseURL: process.env.NEXT_PUBLIC_API as string,
    resource: `orgLeave/${id}`,
  });
}

export async function fetchMyLeave(id: string) {
  return await serviceHandler<TResponse<LeaveRequest>>({
    method: "GET",
    baseURL: process.env.NEXT_PUBLIC_API as string,
    resource: `leave/${id}`,
  });
}
