import {useFormContext, Controller} from "react-hook-form";
import {Listbox} from "@headlessui/react";
import {Fragment} from "react";
import {ChevronDown, Check} from "react-feather";
import clsx from "clsx";

export const FormSelect = ({
  name,
  label,
  options,
}: {
  name: string;
  label: string;
  options: {label: string; value: number | string}[];
}) => {
  const {
    control,
    formState: {errors},
  } = useFormContext();

  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-semibold text-textPrimary">{label}</label>
      <Controller
        name={name}
        control={control}
        render={({field}) => {
          const selected = options.find((opt) => opt.value === field.value) || null;

          return (
            <Listbox value={selected} onChange={(val) => field.onChange(val?.value)}>
              <div className="relative">
                <Listbox.Button className="relative w-full cursor-pointer rounded-md border border-border bg-white py-2 pl-4 pr-10 text-left text-sm text-textPrimary shadow-sm transition hover:border-gray-400 focus:outline-none focus:ring-1 focus:ring-primary">
                  <span className="block truncate">{selected?.label || `Select ${label}`}</span>
                  <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                    <ChevronDown className="size-4 text-gray-400" />
                  </span>
                </Listbox.Button>
                <Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white text-sm shadow-lg ring-1 ring-black/5 focus:outline-none">
                  {options.map((option) => (
                    <Listbox.Option key={option.value} value={option} as={Fragment}>
                      {({active, selected}) => (
                        <li
                          className={clsx(
                            "relative cursor-pointer select-none list-none py-2 pl-10 pr-4",
                            active ? "bg-gray-100 text-gray-900" : "text-gray-700",
                          )}
                        >
                          <span
                            className={clsx("block truncate", {
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
        }}
      />
      {errors[name] && (
        <span className="text-xs font-semibold text-danger">{`${errors[name]?.message}`}</span>
      )}
    </div>
  );
};
