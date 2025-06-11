import useSWR from "swr";
import {fetchUserBookedDates} from "@/services";

export function useBookedDates() {
  const {data, error, isLoading, mutate} = useSWR(
    "user-booked-dates",
    async () => await fetchUserBookedDates(),
  );

  return {
    bookedDates: data?.data?.bookedDates || [],
    isLoading,
    error,
    mutate,
  };
}
