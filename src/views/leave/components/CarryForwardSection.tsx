import React, {useMemo} from "react";
import {PolicySection} from "@/components";
import {PolicyDropdown} from "./PolicyDropdown";

type Policy = {
  id: number;
  name: string;
  canCarryForward: boolean;
};

export const CarryForwardSection = ({
  edit,
  policies,
  onChange,
}: {
  edit: boolean;
  policies: Policy[];
  onChange: (policyId: number, value: boolean) => void;
}) => {
  const options = useMemo(
    () => [
      {label: "Allowed", value: "true"},
      {label: "Not Allowed", value: "false"},
    ],
    [],
  );

  const items = policies.map((policy) => ({
    id: policy.id,
    item: `${policy.name} Carry Forward`,
    value: policy.canCarryForward ? "Allowed" : "Not Allowed",
    editValue: (
      <div className="w-fit min-w-[200px]">
        <PolicyDropdown
          value={policy.canCarryForward.toString()}
          options={options}
          onChange={(value) => onChange(policy.id, value === "true")}
        />
      </div>
    ),
  }));

  return <PolicySection title="Carry Forward And Expiry" edit={edit} items={items} />;
};
