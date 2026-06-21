import {useState} from "react";
import {useController, useFormContext} from "react-hook-form";
import {Autocomplete} from "@/components/AutoComplete/autoComplete";
import {TJobRole} from "@/types/organization";

type FormJobRoleSelectProps = {
  name: string;
  label?: string;
  jobRoles: TJobRole[];
};

export function FormJobRoleSelect({name, label = "Job Title", jobRoles}: FormJobRoleSelectProps) {
  const {control} = useFormContext();
  const {field, fieldState} = useController({name, control});
  const [query, setQuery] = useState("");

  const allOptions = jobRoles.map((r) => ({label: r.title, value: String(r.id)}));
  const filteredOptions =
    query === ""
      ? allOptions
      : allOptions.filter((opt) => opt.label.toLowerCase().includes(query.toLowerCase()));

  const selectedOption = field.value
    ? (allOptions.find((o) => o.value === String(field.value)) ?? null)
    : null;

  const selectedRole = field.value ? jobRoles.find((r) => r.id === Number(field.value)) : null;

  return (
    <div className="flex flex-col gap-1">
      <Autocomplete
        label={label}
        options={filteredOptions}
        value={selectedOption}
        onChange={(option) => {
          field.onChange(Number(option.value));
          setQuery("");
        }}
        onSearch={setQuery}
        placeholder="Search job titles..."
      />
      {selectedRole?.description && (
        <p className="text-xs text-textSecondary">{selectedRole.description}</p>
      )}
      {fieldState.error && (
        <span className="text-xs font-semibold text-danger">{fieldState.error.message}</span>
      )}
    </div>
  );
}
