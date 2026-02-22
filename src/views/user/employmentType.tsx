import {fetchEmploymentTypes} from "@/services/userService";
import {FormSelect} from "@/components";
import useSWR from "swr";

export function EmploymentType() {
  const {error, data, isLoading} = useSWR("fetch-employment-types", fetchEmploymentTypes);

  if (error || !data) {
    return <div>Loading...</div>;
  }
  if (isLoading) {
    return <div>Loading...</div>;
  }

  const options = data.data.map((type) => ({
    label: type.typeLabel,
    value: type.id,
  }));

  return <FormSelect name="employmentTypeId" label="Employment Type" options={options} />;
}
