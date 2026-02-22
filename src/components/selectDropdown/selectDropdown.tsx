import {Fragment, useState} from "react";
import {Listbox, Transition} from "@headlessui/react";
import {ChevronDown, Check} from "react-feather";

interface Option {
  id: string | number;
  label: string;
}

interface SelectProps {
  options: Option[];
  placeholder?: string;
  onChange: (selected: Option) => void;
  defaultValue?: Option;
}

export function SelectDropdown({
  options,
  placeholder = "Select...",
  onChange,
  defaultValue,
}: SelectProps) {
  const [selected, setSelected] = useState<Option | undefined>(defaultValue);

  const handleUpdate = (value: Option) => {
    setSelected(value);
    onChange(value);
  };

  return (
    <div className="w-full">
      <Listbox value={selected} onChange={handleUpdate}>
        <div className="relative">
          <Listbox.Button className="relative w-full cursor-pointer rounded-lg border border-border bg-white py-2.5 pl-3 pr-10 text-left shadow-sm transition-all duration-200 focus:border-primary focus:outline-none sm:text-sm">
            <span className="block truncate font-regular text-textPrimary">
              {selected ? selected.label : placeholder}
            </span>
            <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
              <ChevronDown size={16} className="text-textSecondary" aria-hidden="true" />
            </span>
          </Listbox.Button>

          <Transition
            as={Fragment}
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Listbox.Options className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md border border-border bg-white py-1 text-sm shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
              {options.map((option) => (
                <Listbox.Option
                  key={option.id}
                  className={({active}) =>
                    `relative cursor-pointer select-none py-2.5 pl-10 pr-4 transition-colors ${
                      active ? "bg-background text-primary" : "text-textPrimary"
                    }`
                  }
                  value={option}
                >
                  {({selected: isSelected}) => (
                    <>
                      <span
                        className={`block truncate ${isSelected ? "font-semiBold text-primary" : "font-regular"}`}
                      >
                        {option.label}
                      </span>
                      {isSelected ? (
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-primary">
                          <Check size={14} strokeWidth={3} />
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
}
