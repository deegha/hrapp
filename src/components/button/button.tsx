import React from "react";

interface IButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger";
  href?: string;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  disabled?: boolean;
  loading?: boolean;
}

export const Button: React.FC<IButtonProps> = ({
  variant = "primary",
  href,
  onClick,
  children,
  type = "button",
  disabled = false,
  loading = false,
  ...props
}) => {
  const baseStyles =
    "w-full font-bold p-3 rounded-md transition-all duration-300  text-xs flex items-center justify-center";

  const variants = {
    primary: "bg-[#80CBC4] hover:bg-[#66AFA9] cursor-pointer",
    secondary: "bg-[#FFB433] hover:bg-[#E69E2E] cursor-pointer",
    danger: "bg-[#FF4757] hover:bg-[#D63A49] cursor-pointer",
  };

  const disabledStyles = `cursor-not-allowed bg-border`;

  const buttonClasses = `${baseStyles} ${disabled ? disabledStyles : variants[variant]} text-white`;

  const isDisabled = disabled;

  if (href && !isDisabled) {
    return (
      <a href={href} className={buttonClasses}>
        {children}
      </a>
    );
  }

  return (
    <button
      className={buttonClasses}
      onClick={isDisabled ? undefined : onClick}
      type={type}
      disabled={isDisabled || loading}
      {...props}
    >
      {loading ? (
        <div className="flex items-center gap-2">
          <svg
            className="size-4 animate-spin text-white"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
            ></path>
          </svg>
          Loading...
        </div>
      ) : (
        children
      )}
    </button>
  );
};
