import { serviceHandler } from "@/utils/serviceHandler";
import { TLeaves, LeaveResponse } from "@/types/leave";

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

export async function fetchLeave() {
  return await serviceHandler<LeaveResponse>({
    method: "GET",
    baseURL: process.env.NEXT_PUBLIC_API as string,
    resource: `leave/userLeave`,
  });
}
