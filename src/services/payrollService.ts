import {serviceHandler} from "@/utils/serviceHandler";
import {TResponse} from "@/types";
import {
  TPayroll,
  TPayrollEntry,
  TPayrollSummary,
  TPreflightResult,
  TPayslipEntry,
  TPayslip,
} from "@/types/payroll";

const base = process.env.NEXT_PUBLIC_API as string;

export function fetchPayrolls() {
  return serviceHandler<TResponse<TPayrollSummary[]>>({
    method: "GET",
    baseURL: base,
    resource: "payroll",
  });
}

export function fetchPayroll(id: number) {
  return serviceHandler<TResponse<TPayroll>>({
    method: "GET",
    baseURL: base,
    resource: `payroll/${id}`,
  });
}

export function runPreflightCheck(periodStart: string, periodEnd: string) {
  return serviceHandler<TResponse<TPreflightResult>, {periodStart: string; periodEnd: string}>({
    method: "POST",
    baseURL: base,
    resource: "payroll/preflight",
    body: {periodStart, periodEnd},
  });
}

export function runPayroll(periodStart: string, periodEnd: string) {
  return serviceHandler<
    TResponse<{payrollId: number; status: string; message: string}>,
    {periodStart: string; periodEnd: string}
  >({
    method: "POST",
    baseURL: base,
    resource: "payroll/run",
    body: {periodStart, periodEnd},
  });
}

export function approvePayroll(id: number) {
  return serviceHandler<TResponse<{message: string}>>({
    method: "POST",
    baseURL: base,
    resource: `payroll/${id}/approve`,
  });
}

export function updatePayrollEntry(entryId: number, data: {adjustedGross?: number; note?: string}) {
  return serviceHandler<TResponse<TPayrollEntry>, typeof data>({
    method: "PATCH",
    baseURL: base,
    resource: `payroll/entries/${entryId}`,
    body: data,
  });
}

export function deletePayroll(id: number) {
  return serviceHandler<TResponse<{message: string}>>({
    method: "DELETE",
    baseURL: base,
    resource: `payroll/${id}`,
  });
}

export function fetchPayslips(year?: number, month?: number) {
  const params = new URLSearchParams();
  if (year) params.set("year", String(year));
  if (month) params.set("month", String(month));
  const qs = params.toString();
  return serviceHandler<TResponse<TPayslipEntry[]>>({
    method: "GET",
    baseURL: base,
    resource: `payslips${qs ? `?${qs}` : ""}`,
  });
}

export function fetchPayslip(payrollId: number) {
  return serviceHandler<TResponse<TPayslip>>({
    method: "GET",
    baseURL: base,
    resource: `payslips/${payrollId}`,
  });
}
