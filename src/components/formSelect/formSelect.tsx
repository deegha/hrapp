import { useFormContext } from "react-hook-form";

export const FormSelect = ({
  name,
  label,
  options,
}: {
  name: string;
  label: string;
  options: { label: string; value: number | string }[];
}) => {
  const { register } = useFormContext();

  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm text-textPrimary font-semibold">{label}</label>
      <select
        {...register(name)}
        className="border border-border rounded-lg p-2 text-sm bg-background"
      >
        <option value="">Select {label}</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
};
