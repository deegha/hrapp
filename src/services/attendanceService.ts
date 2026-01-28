import {IAttendance, TResponse, TResponseWithPagination} from "@/types";
import {serviceHandler} from "@/utils/serviceHandler";

import {IAttendancePayload, IAttendanceSummary} from "@/types";

export async function markAttendance(payload: IAttendancePayload) {
  return await serviceHandler<TResponse<IAttendance>, IAttendancePayload>({
    method: "POST",
    baseURL: process.env.NEXT_PUBLIC_API as string,
    body: payload,
    resource: "attendance/mark",
  });
}

export async function getMyAttendanceRecords(page: number = 1, limit: number = 10) {
  return await serviceHandler<TResponseWithPagination<IAttendance[]>>({
    method: "GET",
    baseURL: process.env.NEXT_PUBLIC_API as string,
    resource: `attendance/user${`?page=${page}&limit=${limit}`}`,
  });
}

export async function isAttendanceMarked() {
  return await serviceHandler<TResponse<string | null>>({
    method: "GET",
    baseURL: process.env.NEXT_PUBLIC_API as string,
    resource: `attendance/isMarked`,
  });
}

export async function getAdminAttendanceSummery() {
  return await serviceHandler<TResponse<IAttendanceSummary>>({
    method: "GET",
    baseURL: process.env.NEXT_PUBLIC_API as string,
    resource: `attendance/summary/employer`,
  });
}

export async function downloadAttendanceReport() {
  return await serviceHandler<unknown>({
    method: "GET",
    baseURL: process.env.NEXT_PUBLIC_API as string,
    resource: `attendance/report`,
    responseType: "blob",
  });
}
