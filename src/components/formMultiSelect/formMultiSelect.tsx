import { Listbox } from "@headlessui/react";
import { useController, useFormContext } from "react-hook-form";
import { Check } from "react-feather";
import React from "react";

export const FormMultiSelect = ({
  name,
  label,
  options,
}: {
  name: string;
  label: string;
  options: { label: string; value: number | string }[];
}) => {
  const { control } = useFormContext();
  const { field } = useController({ control, name });

  const selectedValues = field.value || [];

  const toggleValue = (val: any) => {
    if (selectedValues.includes(val)) {
      field.onChange(selectedValues.filter((v: any) => v !== val));
    } else {
      field.onChange([...selectedValues, val]);
    }
  };

  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm text-textPrimary font-semibold">{label}</label>
      <Listbox value={selectedValues} onChange={toggleValue} multiple>
        <div className="border border-border rounded-lg p-2 text-sm bg-background cursor-pointer">
          {options.map((opt) => (
            <Listbox.Option
              key={opt.value}
              value={opt.value}
              as={React.Fragment}
            >
              {({ active, selected }) => (
                <div
                  className={`flex justify-between items-center p-1 ${
                    active ? "bg-primary text-white" : ""
                  }`}
                  onClick={() => toggleValue(opt.value)}
                >
                  <span>{opt.label}</span>
                  {selected && <Check size={14} />}
                </div>
              )}
            </Listbox.Option>
          ))}
        </div>
      </Listbox>
    </div>
  );
};
