import React, { useState } from "react";
import { Eye, EyeOff } from "react-feather";

interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  type?: "text" | "email" | "password";
  placeholder?: string;
  error?: string;
  icon?: React.ReactNode;
  className?: string;
}

export const InputField = React.forwardRef<HTMLInputElement, InputFieldProps>(
  (
    { label, type = "text", placeholder, error, icon, className, ...rest },
    ref
  ) => {
    const [showPassword, setShowPassword] = useState(false);

    return (
      <div className={`flex flex-col w-full`}>
        <label className="text-black  font-medium mb-1 text-sm">{label}</label>
        <div className="relative w-full">
          {icon && (
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            type={type === "password" && !showPassword ? "password" : "text"}
            placeholder={placeholder}
            className={`${className} w-full p-3 border border-border text-sm rounded-md bg-gray-100 text-gray-500 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all pl-${icon ? "10" : "3"} ${
              error ? "text-danger" : "border-gray-200"
            }`}
            {...rest}
          />
          {type === "password" && (
            <button
              type="button"
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <EyeOff className="w-5 h-5" />
              ) : (
                <Eye className="w-5 h-5" />
              )}
            </button>
          )}
        </div>
        {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
      </div>
    );
  }
);

InputField.displayName = "InputField";
