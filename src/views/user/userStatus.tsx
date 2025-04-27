import { fetchUserStatus } from "@/services/";
import { FormSelect } from "@/components";
import useSWR from "swr";

export function UserStatus() {
  const { error, data, isLoading } = useSWR(
    "fetch-use-status",
    fetchUserStatus
  );

  if (error || !data) {
    return <div>Loading...</div>;
  }
  if (isLoading) {
    return <div>Loading...</div>;
  }

  const options = data.data.map((status) => ({
    label: status.statusLabel
      .toLowerCase()
      .replace(/^\w/, (c) => c.toUpperCase()),
    value: status.id,
  }));

  return <FormSelect name="userStatus" label="User Status" options={options} />;
}
