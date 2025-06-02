import React, {useState} from "react";
import {Eye, EyeOff} from "react-feather";

interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  type?: "text" | "email" | "password";
  placeholder?: string;
  error?: string;
  icon?: React.ReactNode;
  className?: string;
}

export const InputField = React.forwardRef<HTMLInputElement, InputFieldProps>(
  ({label, type = "text", placeholder, error, icon, className, ...rest}, ref) => {
    const [showPassword, setShowPassword] = useState(false);

    return (
      <div className={`flex w-full flex-col`}>
        <label className="mb-1 text-sm font-medium text-black">{label}</label>
        <div className="relative w-full">
          {icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">{icon}</div>
          )}
          <input
            ref={ref}
            type={type === "password" && !showPassword ? "password" : "text"}
            placeholder={placeholder}
            className={`${className} w-full rounded-md border border-border bg-gray-100 p-3 text-sm text-gray-500 transition-all placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 pl-${icon ? "10" : "3"} ${
              error ? "text-danger" : "border-gray-200"
            }`}
            {...rest}
          />
          {type === "password" && (
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
            </button>
          )}
        </div>
        {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
      </div>
    );
  },
);

InputField.displayName = "InputField";
