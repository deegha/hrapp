import {useEffect, useState} from "react";
import {useController, useFormContext} from "react-hook-form";

type FormCurrencyInputProps = {
  name: string;
  label?: string;
  placeholder?: string;
};

function formatWithCommas(n: number): string {
  return new Intl.NumberFormat("en-US").format(n);
}

export function FormCurrencyInput({
  name,
  label = "Salary (LKR)",
  placeholder = "0",
}: FormCurrencyInputProps) {
  const {control} = useFormContext();
  const {field, fieldState} = useController({name, control});

  const [displayValue, setDisplayValue] = useState<string>(
    field.value != null && field.value !== "" ? formatWithCommas(Number(field.value)) : "",
  );

  useEffect(() => {
    const val = field.value;
    if (val != null && val !== "") {
      setDisplayValue(formatWithCommas(Number(val)));
    } else {
      setDisplayValue("");
    }
  }, [field.value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digits = e.target.value.replace(/[^\d]/g, "");
    if (digits === "") {
      setDisplayValue("");
      field.onChange(undefined);
      return;
    }
    const num = parseInt(digits, 10);
    setDisplayValue(formatWithCommas(num));
    field.onChange(num);
  };

  return (
    <div className="flex flex-col gap-1">
      {label && <label className="text-sm font-semibold text-textPrimary">{label}</label>}
      <div className="relative flex items-center">
        <span className="pointer-events-none absolute left-3 select-none text-sm font-medium text-textSecondary">
          LKR
        </span>
        <input
          type="text"
          inputMode="numeric"
          value={displayValue}
          onChange={handleChange}
          placeholder={placeholder}
          className="w-full rounded-md border border-border bg-white py-2 pl-14 pr-3 text-sm text-textPrimary focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>
      {fieldState.error && (
        <span className="text-xs font-semibold text-danger">{fieldState.error.message}</span>
      )}
    </div>
  );
}
