import {serviceHandler} from "@/utils/serviceHandler";
import {
  TLeaves,
  LeaveRequest,
  LeaveRequestWithUser,
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
  return await serviceHandler<TCreateLeaveRequestResponse, TCreateLeaveRequestPayload>({
    method: "POST",
    body: payload,
    baseURL: process.env.NEXT_PUBLIC_API as string,
    resource: "leave",
  });
}

export async function fetchLeave({page, limit}: TGenericFilters) {
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

export async function fetchLeaveBalance() {
  return await serviceHandler<
    TResponse<{
      yearlyAllowance: number;
      usedDays: number;
      remainingDays: number;
      leaveTypeBalances: Array<{
        id: number;
        name: string;
        yearlyAllowance: number;
        usedDays: number;
        remainingDays: number;
      }>;
    }>
  >({
    method: "GET",
    baseURL: process.env.NEXT_PUBLIC_API as string,
    resource: "leave-balance",
  });
}

export async function fetchUpcomingCompanyLeaves() {
  return await serviceHandler<TResponse<LeaveRequestWithUser[]>>({
    method: "GET",
    baseURL: process.env.NEXT_PUBLIC_API as string,
    resource: "upcoming-company-leaves",
  });
}

export async function fetchUserBookedDates() {
  return await serviceHandler<
    TResponse<{
      bookedDates: Array<{
        date: string;
        status: string;
        halfDay: string | null;
        leaveType: number;
      }>;
    }>
  >({
    method: "GET",
    baseURL: process.env.NEXT_PUBLIC_API as string,
    resource: "user-booked-dates",
  });
}
