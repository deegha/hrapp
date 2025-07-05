export function Detail({
  label,
  value,
  type = "text",
}: {
  label: string;
  value: string | number;
  type?: "email" | "text";
}) {
  return (
    <div className="grid grid-cols-2 text-sm">
      <span className="text-textSecondary">{label}</span>
      <span className={type === "email" ? "font-semibold" : "font-semibold capitalize"}>
        {value}
      </span>
    </div>
  );
}
