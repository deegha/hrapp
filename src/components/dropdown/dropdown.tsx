// components/Dropdown.tsx
"use client";

import { Fragment } from "react";
import { Listbox, Transition } from "@headlessui/react";
import { ChevronDown, Check } from "react-feather";
import { cn } from "@/utils/cn";

type Option = {
  label: string;
  value: string;
};

type DropdownProps = {
  options: Option[];
  value: Option;
  onChange: (value: Option) => void;
  placeholder?: string;
};

export const Dropdown = ({
  options,
  value,
  onChange,
  placeholder = "Select an option",
}: DropdownProps) => {
  return (
    <div className="w-full">
      <Listbox value={value} onChange={onChange}>
        <div className="relative">
          <Listbox.Button
            className={cn(
              "relative w-full cursor-pointer rounded-md border border-border bg-white py-3 pl-4 pr-10 text-left shadow-sm text-sm text-textPrimary",
              "hover:border-gray-400 focus:outline-none focus:ring-1 focus:ring-primary transition"
            )}
          >
            <span className="block truncate">
              {value?.label || placeholder}
            </span>
            <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
              <ChevronDown className="h-4 w-4 text-textSecondary" />
            </span>
          </Listbox.Button>

          <Transition
            as={Fragment}
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Listbox.Options className="absolute mt-2 max-h-60 w-full overflow-auto rounded-2xl bg-white py-1 text-sm shadow-md ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
              {options.map((option) => (
                <Listbox.Option
                  key={option.value}
                  className={({ active }) =>
                    cn(
                      "relative cursor-pointer select-none py-3 pl-10 pr-4",
                      active ? "bg-gray-100 text-gray-900" : "text-gray-700"
                    )
                  }
                  value={option}
                >
                  {({ selected }) => (
                    <>
                      <span
                        className={cn(
                          "block truncate",
                          selected ? "font-medium" : "font-normal"
                        )}
                      >
                        {option.label}
                      </span>
                      {selected ? (
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-primary">
                          <Check className="h-4 w-4" />
                        </span>
                      ) : null}
                    </>
                  )}
                </Listbox.Option>
              ))}
            </Listbox.Options>
          </Transition>
        </div>
      </Listbox>
    </div>
  );
};
