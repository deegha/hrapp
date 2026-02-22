import React from "react";

export function Detail({
  label,
  value,
  type = "text",
  loading = false,
}: {
  label: string;
  value: React.ReactNode;
  type?: "email" | "text" | "component";
  loading?: boolean;
}) {
  return (
    <div className="grid grid-cols-2 text-sm">
      <span className="text-textSecondary">{label}</span>
      <span className={type === "email" ? "font-semibold" : "font-semibold capitalize"}>
        {loading ? "Please wait" : value}
      </span>
    </div>
  );
}
