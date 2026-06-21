import {useEffect, useState} from "react";
import {useController, useFormContext} from "react-hook-form";

type FormAccountInputProps = {
  name: string;
  label?: string;
  placeholder?: string;
};

function formatAccount(digits: string): string {
  return digits.match(/.{1,4}/g)?.join(" ") ?? "";
}

export function FormAccountInput({
  name,
  label = "Bank Account Number",
  placeholder = "0000 0000 0000 0000",
}: FormAccountInputProps) {
  const {control} = useFormContext();
  const {field, fieldState} = useController({name, control});

  const [displayValue, setDisplayValue] = useState<string>(
    field.value ? formatAccount(String(field.value).replace(/\s/g, "")) : "",
  );

  useEffect(() => {
    if (field.value) {
      setDisplayValue(formatAccount(String(field.value).replace(/\s/g, "")));
    } else {
      setDisplayValue("");
    }
  }, [field.value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digits = e.target.value.replace(/\D/g, "");
    setDisplayValue(formatAccount(digits));
    field.onChange(digits || undefined);
  };

  return (
    <div className="flex flex-col gap-1">
      {label && <label className="text-sm font-semibold text-textPrimary">{label}</label>}
      <input
        type="text"
        inputMode="numeric"
        value={displayValue}
        onChange={handleChange}
        placeholder={placeholder}
        className="w-full rounded-md border border-border bg-white p-2 text-sm text-textPrimary focus:outline-none focus:ring-2 focus:ring-primary"
      />
      {fieldState.error && (
        <span className="text-xs font-semibold text-danger">{fieldState.error.message}</span>
      )}
    </div>
  );
}
