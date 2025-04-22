import { serviceHandler } from "@/utils/serviceHandler";
import { TLeaves } from "@/types/leave";

type TCreateLeaveRequestResponse = {
  error: boolean;
  data: string;
};

type TCreateLeaveRequestPayload = {
  leaves: Array<TLeaves>;
  leaveType: string;
  documents?: Array<string>;
  additionalNotes?: string;
};

export async function createLeaveRequest(payload: TCreateLeaveRequestPayload) {
  return await serviceHandler<
    TCreateLeaveRequestResponse,
    TCreateLeaveRequestPayload
  >({
    method: "POST",
    body: payload,
    baseURL: process.env.NEXT_PUBLIC_API as string,
    resource: "navigation",
  });
}
