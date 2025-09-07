import React from "react";
import {PolicySection} from "@/components";
import {EmploymentDaysEditor} from "./EmploymentDaysEditor";
import {Trash2} from "react-feather";

type EmploymentType = {typeLabel: string};

type Policy = {
  id: number;
  name: string;
  daysPerYear: number;
  daysPerEmploymentType?: Record<string, number>;
};

export const EntitlementsSection = ({
  edit,
  policies,
  employmentTypes,
  onChangeDays,
  onDelete,
}: {
  edit: boolean;
  policies: Policy[];
  employmentTypes: EmploymentType[];
  onChangeDays: (policyId: number, label: string, days: number) => void;
  onDelete: (policyId: number) => void;
}) => {
  const items = policies.map((policy) => {
    const employmentTypeDays = employmentTypes.map((empType) => {
      const days = policy.daysPerEmploymentType?.[empType.typeLabel] ?? policy.daysPerYear;
      return {typeLabel: empType.typeLabel, days};
    });

    return {
      id: policy.id,
      item: policy.name,
      value: edit
        ? ""
        : employmentTypeDays.map((emp) => `${emp.typeLabel}: ${emp.days}`).join(", ") +
          " days per year",
      editValue: edit ? (
        <EmploymentDaysEditor
          employmentTypes={employmentTypes}
          daysByType={policy.daysPerEmploymentType}
          fallback={policy.daysPerYear}
          onChange={(label, days) => onChangeDays(policy.id, label, days)}
        />
      ) : undefined,
      action: !edit ? (
        <button
          onClick={() => onDelete(policy.id)}
          className="flex items-center justify-center rounded-md p-2 text-red-500 hover:bg-red-50 hover:text-red-700"
          title="Delete leave type"
        >
          <Trash2 size={16} />
        </button>
      ) : undefined,
    };
  });

  return <PolicySection edit={edit} title="Leave Type And Entitlements" items={items} />;
};
