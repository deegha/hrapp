import {IAttendance, TResponse, TResponseWithPagination, TWFHRequest} from "@/types";
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

export async function getMyAttendanceRecords(
  page: number = 1,
  limit: number = 10,
  fromDate?: string,
  toDate?: string,
) {
  const tz =
    typeof window !== "undefined" ? Intl.DateTimeFormat().resolvedOptions().timeZone : "UTC";
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
    tz,
    ...(fromDate && {fromDate}),
    ...(toDate && {toDate}),
  });

  return await serviceHandler<TResponseWithPagination<IAttendance[]>>({
    method: "GET",
    baseURL: process.env.NEXT_PUBLIC_API as string,
    resource: `attendance/user?${params.toString()}`,
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
  const tz =
    typeof window !== "undefined" ? Intl.DateTimeFormat().resolvedOptions().timeZone : "UTC";
  return await serviceHandler<TResponse<IAttendanceSummary>>({
    method: "GET",
    baseURL: process.env.NEXT_PUBLIC_API as string,
    resource: `attendance/summary/employer?tz=${encodeURIComponent(tz)}`,
  });
}

export async function downloadAttendanceReport(date: Date) {
  const tz =
    typeof window !== "undefined" ? Intl.DateTimeFormat().resolvedOptions().timeZone : "UTC";
  return await serviceHandler<unknown, {reportDate: Date; timezone: string}>({
    method: "POST",
    baseURL: process.env.NEXT_PUBLIC_API as string,
    resource: `attendance/report`,
    responseType: "blob",
    body: {reportDate: date, timezone: tz},
  });
}

export async function requestWFH(payload: {
  date: string;
  latitude?: number;
  longitude?: number;
  note: string;
}) {
  return await serviceHandler<TResponse<TWFHRequest>, typeof payload>({
    method: "POST",
    baseURL: process.env.NEXT_PUBLIC_API as string,
    resource: "attendance/wfh-request",
    body: payload,
  });
}

export async function fetchWFHRequest(id: string) {
  return await serviceHandler<TResponse<TWFHRequest>>({
    method: "GET",
    baseURL: process.env.NEXT_PUBLIC_API as string,
    resource: `attendance/wfh-request/${id}`,
  });
}

export async function getMyWFHRequests() {
  return await serviceHandler<TResponse<TWFHRequest[]>>({
    method: "GET",
    baseURL: process.env.NEXT_PUBLIC_API as string,
    resource: `attendance/wfh-requests/my`,
  });
}

export async function getUserAttendanceById(
  userId: number,
  page: number = 1,
  limit: number = 10,
  fromDate?: string,
  toDate?: string,
) {
  const tz =
    typeof window !== "undefined" ? Intl.DateTimeFormat().resolvedOptions().timeZone : "UTC";
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
    tz,
    ...(fromDate && {fromDate}),
    ...(toDate && {toDate}),
  });

  return await serviceHandler<TResponseWithPagination<IAttendance[]>>({
    method: "GET",
    baseURL: process.env.NEXT_PUBLIC_API as string,
    resource: `attendance/user/by-id/${userId}?${params.toString()}`,
  });
}

export async function updateUserAttendance(
  userId: number,
  payload: {date: string; checkInTime?: string; checkOutTime?: string; timezone: string},
) {
  return await serviceHandler<TResponse<{message: string}>, typeof payload>({
    method: "PUT",
    baseURL: process.env.NEXT_PUBLIC_API as string,
    resource: `attendance/user/by-id/${userId}/update`,
    body: payload,
  });
}
