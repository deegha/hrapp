export function Detail({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div className="grid grid-cols-2  text-sm">
      <span className="text-textSecondary">{label}</span>
      <span className="font-semibold capitalize">{value}</span>
    </div>
  );
}
