import React from "react";

interface IButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger";
  href?: string;
  onClick?: () => void;
}

export const Button: React.FC<IButtonProps> = ({
  variant = "primary",
  href,
  onClick,
  children,
  type = "button",
  ...props
}) => {
  const baseStyles =
    "w-full text-white font-bold p-3 rounded-lg transition-all duration-300 cursor-pointer text-xs";
  const variants = {
    primary: "bg-[#80CBC4] hover:bg-[#66AFA9]",
    secondary: "bg-[#FFB433] hover:bg-[#E69E2E]",
    danger: "bg-[#FF4757] hover:bg-[#D63A49]",
  };

  if (href) {
    return (
      <a
        href={href}
        className={`${baseStyles} ${variants[variant]} flex items-center justify-center`}
      >
        {children}
      </a>
    );
  }

  return (
    <button
      className={`${baseStyles} ${variants[variant]}`}
      onClick={onClick}
      type={type}
      {...props}
    >
      {children}
    </button>
  );
};
