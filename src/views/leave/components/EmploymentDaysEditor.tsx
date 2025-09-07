import React from "react";
import {InputField} from "@/components";

type EmploymentType = {typeLabel: string};

export const EmploymentDaysEditor = ({
  employmentTypes,
  daysByType,
  fallback,
  onChange,
  inputClassName,
}: {
  employmentTypes: EmploymentType[];
  daysByType?: Record<string, number>;
  fallback?: number;
  onChange: (typeLabel: string, days: number) => void;
  inputClassName?: string;
}) => {
  return (
    <div className="grid grid-cols-3 gap-3">
      {employmentTypes.map((empType) => {
        const label = empType.typeLabel;
        const value = (daysByType && daysByType[label]) ?? fallback ?? 0;
        return (
          <div key={label}>
            <label className="mb-1 block text-xs font-medium text-gray-600">{label}</label>
            <InputField
              value={value.toString()}
              onChange={(e) => onChange(label, parseInt(e.target.value) || 0)}
              className={inputClassName}
            />
          </div>
        );
      })}
    </div>
  );
};
