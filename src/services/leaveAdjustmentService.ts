import {serviceHandler} from "@/utils/serviceHandler";
import {
  TLeaveAdjustmentsResponse,
  TLeaveAdjustment,
  TCreateLeaveAdjustmentPayload,
} from "@/types/leaveAdjustment";

const BASE = process.env.NEXT_PUBLIC_API as string;

export async function fetchLeaveAdjustments(employeeId: number) {
  return serviceHandler<{error: boolean; data: TLeaveAdjustmentsResponse}, undefined>({
    method: "GET",
    baseURL: BASE,
    resource: `users/${employeeId}/leave-adjustments`,
  });
}

export async function createLeaveAdjustment(
  employeeId: number,
  payload: TCreateLeaveAdjustmentPayload,
) {
  return serviceHandler<{error: boolean; data: TLeaveAdjustment}, TCreateLeaveAdjustmentPayload>({
    method: "POST",
    baseURL: BASE,
    resource: `users/${employeeId}/leave-adjustments`,
    body: payload,
  });
}
