import useSWR from "swr";
import {fetchLeaveTypes} from "@/services";
import {TLeaveType} from "@/types";

export function useLeaveTypes() {
  const {data, error, isLoading, mutate} = useSWR("leave-types", async () => {
    const response = await fetchLeaveTypes();
    return response.data || [];
  });

  return {
    leaveTypes: (data as TLeaveType[]) || [],
    isLoading,
    error,
    refetch: mutate,
  };
}
