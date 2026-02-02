import {fetchOrganizationLocationSettings} from "@/services";
import useSWR from "swr";

export function useOfficeLocationSettings() {
  const {data, isLoading, error} = useSWR("fetch-organization-location-settings", async () => {
    const response = await fetchOrganizationLocationSettings();
    return response.data;
  });

  return {
    locationSettings: data,
    isLoadingLocationSettings: isLoading,
    isErrorLocationSettings: error,
  };
}
