import {fetchMyDetails} from "@/services/userService";
import useSWR from "swr";

export function useMyDetails() {
  const {data: userData} = useSWR(`fetch-auth-user`, async () => {
    const details = await fetchMyDetails();

    return details.data;
  });

  console.log(userData, "userData");

  return {
    userId: userData?.employeeId,
  };
}
