import React, {useMemo} from "react";
import {PolicySection} from "@/components";
import {PolicyDropdown} from "./PolicyDropdown";

type Policy = {
  id: number;
  name: string;
  accrualType: "ALL_FROM_DAY_1" | "HALF_DAY_PER_MONTH" | string;
};

export const AccrualSection = ({
  edit,
  policies,
  onChange,
}: {
  edit: boolean;
  policies: Policy[];
  onChange: (policyId: number, value: string) => void;
}) => {
  const accrualOptions = useMemo(
    () => [
      {label: "All from Day 1", value: "ALL_FROM_DAY_1"},
      {label: "Half Day per Month", value: "HALF_DAY_PER_MONTH"},
    ],
    [],
  );

  const items = policies.map((policy) => ({
    id: policy.id,
    item: `${policy.name} Accrual Type`,
    value: policy.accrualType === "ALL_FROM_DAY_1" ? "All from Day 1" : "Half Day per Month",
    editValue: (
      <div className="w-fit min-w-[200px]">
        <PolicyDropdown
          value={policy.accrualType}
          options={accrualOptions}
          onChange={(value) => onChange(policy.id, value)}
        />
      </div>
    ),
  }));

  return <PolicySection edit={edit} title="Accrual Rule" items={items} />;
};
