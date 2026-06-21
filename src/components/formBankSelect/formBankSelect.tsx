import {useState} from "react";
import {useController, useFormContext} from "react-hook-form";
import {Autocomplete} from "@/components/AutoComplete/autoComplete";
import {SRI_LANKAN_BANKS} from "@/constants/sriLankanBanks";

type FormBankSelectProps = {
  name: string;
  label?: string;
};

export function FormBankSelect({name, label = "Bank"}: FormBankSelectProps) {
  const {control} = useFormContext();
  const {field, fieldState} = useController({name, control});
  const [query, setQuery] = useState("");

  const allOptions = SRI_LANKAN_BANKS.map((b) => ({label: b, value: b}));
  const filteredOptions =
    query === ""
      ? allOptions
      : allOptions.filter((opt) => opt.label.toLowerCase().includes(query.toLowerCase()));

  const selectedOption = field.value
    ? {label: field.value as string, value: field.value as string}
    : null;

  return (
    <div className="flex flex-col gap-1">
      <Autocomplete
        label={label}
        options={filteredOptions}
        value={selectedOption}
        onChange={(option) => {
          field.onChange(option.value);
          setQuery("");
        }}
        onSearch={setQuery}
        placeholder="Search for a bank..."
      />
      {fieldState.error && (
        <span className="text-xs font-semibold text-danger">{fieldState.error.message}</span>
      )}
    </div>
  );
}
