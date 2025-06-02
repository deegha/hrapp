import {fetchPermission} from "@/services/";
import {FormSelect} from "@/components";
import useSWR from "swr";
import {roles, RoleKey} from "@/utils/staticValues";

export function UserRole() {
  const {error, data, isLoading} = useSWR("fetch-permission", fetchPermission);

  if (error || !data) {
    return <div>Loading...</div>;
  }
  if (isLoading) {
    return <div>Loading...</div>;
  }

  const options = data.data.map((status) => ({
    label: roles[status.permission as RoleKey],
    value: status.permission,
  }));

  return <FormSelect name="userRole" label="User Role" options={options} />;
}
