import useSWR from "swr";
import {fetchSalaryBreakdown, SalaryBreakdown} from "@/services/statutoryService";

export function useSalaryBreakdown(
  grossSalary: number | undefined,
  isFlatSalary?: boolean,
): {breakdown: SalaryBreakdown | null; isLoading: boolean} {
  const shouldFetch = !!grossSalary && grossSalary > 0 && !isFlatSalary;
  const {data, isLoading} = useSWR(
    shouldFetch ? `salary-breakdown-${grossSalary}` : null,
    () => fetchSalaryBreakdown(grossSalary!),
    {revalidateOnFocus: false},
  );
  return {breakdown: data?.data ?? null, isLoading};
}
