import {InputHTMLAttributes} from "react";
import {useFormContext} from "react-hook-form";

interface FormInputProps extends InputHTMLAttributes<HTMLInputElement> {
  name: string;
  label: string;
}

export function FormInput({name, label, ...rest}: FormInputProps) {
  const {
    register,
    formState: {errors},
  } = useFormContext();

  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={name} className="text-sm font-semibold text-textPrimary">
        {label}
      </label>
      <input
        id={name}
        {...register(name)}
        className="rounded-md border border-border bg-white p-2 text-sm text-textPrimary focus:outline-none focus:ring-2 focus:ring-primary"
        {...rest}
      />
      {errors[name] && (
        <span className="text-xs font-semibold text-danger">{`${errors[name]?.message}`}</span>
      )}
    </div>
  );
}
