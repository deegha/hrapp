import {Fragment} from "react";
import {Listbox, Transition} from "@headlessui/react";
import {ChevronDown, Check, Info} from "react-feather";
import {cn} from "@/utils/cn";

type Option = {
  label: string;
  value: string;
  disabled?: boolean;
  tooltip?: string;
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
              "relative w-full cursor-pointer rounded-md border border-border bg-white py-3 pl-4 pr-10 text-left text-sm text-textPrimary shadow-sm",
              "transition hover:border-gray-400 focus:outline-none focus:ring-1 focus:ring-primary",
            )}
          >
            <span className="block truncate">{value?.label || placeholder}</span>
            <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
              <ChevronDown className="size-4 text-textSecondary" />
            </span>
          </Listbox.Button>

          <Transition
            as={Fragment}
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Listbox.Options className="absolute z-50 mt-2 max-h-60 w-full overflow-auto rounded-2xl bg-white py-1 text-sm shadow-md ring-1 ring-black/5 focus:outline-none">
              {options.map((option) => (
                <Listbox.Option
                  key={option.value}
                  className={({active}) =>
                    cn(
                      "relative select-none py-3 pl-10 pr-4",
                      option.disabled ? "cursor-not-allowed text-gray-400" : "cursor-pointer",
                      active && !option.disabled ? "bg-gray-100 text-gray-900" : "text-gray-700",
                    )
                  }
                  value={option}
                  disabled={option.disabled}
                  title={option.disabled ? option.tooltip : undefined}
                >
                  {({selected}) => (
                    <>
                      <div className="flex items-center gap-2">
                        <span
                          className={cn(
                            "block truncate",
                            selected ? "font-medium" : "font-normal",
                            option.disabled ? "text-gray-400" : "",
                          )}
                        >
                          {option.label}
                        </span>
                        {option.disabled && <Info className="size-4 shrink-0 text-gray-400" />}
                      </div>
                      {selected && !option.disabled ? (
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-primary">
                          <Check className="size-4" />
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
