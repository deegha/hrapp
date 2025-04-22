import { cn } from "@/utils/cn";

type TextAreaProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  disabled?: boolean;
};

export const TextArea = ({
  value,
  onChange,
  placeholder = "Enter text...",
  rows = 4,
  disabled = false,
}: TextAreaProps) => {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      disabled={disabled}
      className={cn(
        "w-full rounded-md border border-border bg-white p-4 text-sm text-textPrimary shadow-sm",
        "placeholder:text-textSecondary focus:outline-none focus:ring-1 focus:ring-primary",
        "hover:border-gray-400 transition resize-none",
        disabled && "opacity-50 cursor-not-allowed"
      )}
    />
  );
};
