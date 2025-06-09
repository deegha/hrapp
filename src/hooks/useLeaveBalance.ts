import useSWR from "swr";
import {fetchLeaveBalance} from "@/services";

export function useLeaveBalance() {
  const {data, error, isLoading} = useSWR("leave-balance", async () => await fetchLeaveBalance());

  return {
    leaveBalance: data?.data || null,
    isLoading,
    error,
  };
}
