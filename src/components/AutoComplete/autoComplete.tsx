import {Fragment} from "react";
import {Combobox, Transition} from "@headlessui/react";
import {Check, ChevronDown, Info} from "react-feather";
import {cn} from "@/utils/cn";

type Option = {
  label: string;
  value: string;
  disabled?: boolean;
  tooltip?: string;
};

type AutocompleteProps = {
  options: Option[];
  value: Option | null;
  onChange: (value: Option) => void;
  onSearch: (query: string) => void;
  placeholder?: string;
  loading?: boolean;
};

export const Autocomplete = ({
  options,
  value,
  onChange,
  onSearch,
  placeholder = "Search...",
  loading,
}: AutocompleteProps) => {
  return (
    <div className="w-full">
      <Combobox value={value} onChange={onChange}>
        <div className="relative">
          <div className="relative w-full cursor-pointer rounded-md border border-border bg-white py-3 pl-4 pr-10 text-left text-sm text-textPrimary shadow-sm transition hover:border-gray-400 focus:outline-none focus:ring-1 focus:ring-primary">
            <Combobox.Input
              className="w-full border-none bg-transparent text-sm focus:outline-none"
              displayValue={(option: Option) => (loading ? "Please wait..." : option?.label || "")}
              onChange={(e) => onSearch(e.target.value)}
              placeholder={placeholder}
            />
            <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-3">
              <ChevronDown className="size-4 text-textSecondary" />
            </Combobox.Button>
          </div>

          <Transition
            as={Fragment}
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Combobox.Options className="absolute z-50 mt-2 max-h-60 w-full overflow-auto rounded-sm bg-white py-1 text-sm shadow-md ring-1 ring-black/5 focus:outline-none">
              {options.length === 0 ? (
                <div className="relative cursor-default select-none px-4 py-2 text-gray-500">
                  No results found.
                </div>
              ) : (
                options.map((option) => (
                  <Combobox.Option
                    key={option.value}
                    value={option}
                    disabled={option.disabled}
                    title={option.disabled ? option.tooltip : undefined}
                    className={({active}) =>
                      cn(
                        "relative select-none py-3 pl-10 pr-4",
                        option.disabled ? "cursor-not-allowed text-gray-400" : "cursor-pointer",
                        active && !option.disabled ? "bg-gray-100 text-gray-900" : "text-gray-700",
                      )
                    }
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
                  </Combobox.Option>
                ))
              )}
            </Combobox.Options>
          </Transition>
        </div>
      </Combobox>
    </div>
  );
};
