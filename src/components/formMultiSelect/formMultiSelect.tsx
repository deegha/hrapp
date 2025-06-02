import {Listbox} from "@headlessui/react";
import {useController, useFormContext} from "react-hook-form";
import {Check} from "react-feather";
import React from "react";

type Option = {label: string; value: number | string};

interface FormMultiSelectProps {
  name: string;
  label: string;
  options: Option[];
}

export const FormMultiSelect: React.FC<FormMultiSelectProps> = ({name, label, options}) => {
  const {control} = useFormContext();
  const {field} = useController({control, name});

  const selectedValues: (number | string)[] = field.value || [];

  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-semibold text-textPrimary">{label}</label>
      <Listbox
        value={selectedValues}
        onChange={(newValues: (number | string)[]) => field.onChange(newValues)}
        multiple
      >
        <div className="cursor-pointer rounded-md border border-border p-2 text-sm">
          {options.map((opt) => (
            <Listbox.Option key={opt.value} value={opt.value} as={React.Fragment}>
              {({active, selected}) => (
                <div
                  className={`my-2 flex items-center justify-between rounded-md p-1 ${
                    active ? "bg-primary text-white" : ""
                  } ${selected ? "" : ""}`}
                >
                  <span>{opt.label}</span>
                  {selected && <Check size={14} className="font-semibold text-primary" />}
                </div>
              )}
            </Listbox.Option>
          ))}
        </div>
      </Listbox>
    </div>
  );
};
