import React, {useMemo} from "react";
import {PolicySection} from "@/components";
import {PolicyDropdown} from "./PolicyDropdown";
import {TApplicableGender} from "@/types";

type Policy = {
  id: number;
  name: string;
  applicableGender: TApplicableGender;
};

const GENDER_LABELS: Record<TApplicableGender, string> = {
  ALL: "All Employees",
  FEMALE: "Female Only",
  MALE: "Male Only",
};

export const GenderRestrictionSection = ({
  edit,
  policies,
  onChange,
}: {
  edit: boolean;
  policies: Policy[];
  onChange: (policyId: number, value: TApplicableGender) => void;
}) => {
  const options = useMemo(
    () => [
      {label: "All Employees", value: "ALL"},
      {label: "Female Only", value: "FEMALE"},
      {label: "Male Only", value: "MALE"},
    ],
    [],
  );

  const items = policies.map((policy) => ({
    id: policy.id,
    item: `${policy.name} Applicable To`,
    value: GENDER_LABELS[policy.applicableGender] ?? "All Employees",
    editValue: (
      <div className="w-fit min-w-[200px]">
        <PolicyDropdown
          value={policy.applicableGender}
          options={options}
          onChange={(value) => onChange(policy.id, value as TApplicableGender)}
        />
      </div>
    ),
  }));

  return <PolicySection title="Eligibility" edit={edit} items={items} />;
};
