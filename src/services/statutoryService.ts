import {serviceHandler} from "@/utils/serviceHandler";
import {TResponse} from "@/types";

export type SalaryBreakdown = {
  grossSalary: number;
  epfEmployee: number;
  epfEmployer: number;
  etfEmployer: number;
  taxableMonthly: number;
  monthlyTax: number;
  netSalary: number;
  totalEmployerCost: number;
  currency: string;
};

export async function fetchSalaryBreakdown(grossSalary: number) {
  return serviceHandler<TResponse<SalaryBreakdown>, {grossSalary: number}>({
    method: "POST",
    body: {grossSalary},
    baseURL: process.env.NEXT_PUBLIC_API as string,
    resource: "organization/salary-breakdown",
  });
}
