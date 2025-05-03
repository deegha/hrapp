interface IProps {
  status: string;
  type: "ACTIVE" | "PENDING" | "DELETED";
}

export function StatusTag({ status, type }: IProps) {
  const typeStyles: Record<IProps["type"], string> = {
    ACTIVE: "bg-accent text-textPrimary border-border",
    PENDING: "bg-secondary text-white border-border",
    DELETED: "bg-danger text-white border-border",
  };

  return (
    <div
      className={`inline-block px-3 py-1 text-sm lowercase font-medium rounded-full border ${typeStyles[type]}`}
    >
      {status}
    </div>
  );
}
