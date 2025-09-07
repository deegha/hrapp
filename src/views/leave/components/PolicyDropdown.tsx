import {Listbox} from "@headlessui/react";
import {ChevronDown, Check} from "react-feather";
import clsx from "clsx";
import React from "react";

export type PolicyDropdownOption = {
  label: string;
  value: string;
};

export const PolicyDropdown = ({
  value,
  options,
  onChange,
  className,
}: {
  value: string;
  options: PolicyDropdownOption[];
  onChange: (value: string) => void;
  className?: string;
}) => {
  const selected = options.find((opt) => opt.value === value) || null;

  return (
    <Listbox value={selected} onChange={(val) => onChange(val?.value || "")}>
      <div className={clsx("relative min-w-[200px]", className)}>
        <Listbox.Button className="relative w-full cursor-default rounded-md border border-border py-2 pl-3 pr-10 text-left text-sm">
          <span className="block">{selected?.label || "Select option"}</span>
          <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
            <ChevronDown className="size-4 text-gray-400" />
          </span>
        </Listbox.Button>
        <Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white text-sm shadow-lg ring-1 ring-black/5 focus:outline-none">
          {options.map((option) => (
            <Listbox.Option key={option.value} value={option}>
              {({active, selected}) => (
                <li
                  className={clsx(
                    "relative cursor-pointer select-none list-none py-2 pl-10 pr-4",
                    active ? "bg-gray-100 text-gray-900" : "text-gray-700",
                  )}
                >
                  <span
                    className={clsx("block", {
                      "font-medium": selected,
                      "font-normal": !selected,
                    })}
                  >
                    {option.label}
                  </span>
                  {selected && (
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-primary">
                      <Check size={16} />
                    </span>
                  )}
                </li>
              )}
            </Listbox.Option>
          ))}
        </Listbox.Options>
      </div>
    </Listbox>
  );
};
