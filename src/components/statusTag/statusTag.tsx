interface IProps {
  status: "CONFIRMED" | "DEACTIVATED" | "DELETED" | "CREATED" | "APPROVED";
}

export function StatusTag({ status }: IProps) {
  const typeStyles: Record<IProps["status"], string> = {
    CREATED: "bg-accent text-textPrimary border-border",
    CONFIRMED: "bg-primary text-textPrimary border-border",
    APPROVED: "bg-primary text-textPrimary border-border",
    DEACTIVATED: "bg-secondary text-white border-border",
    DELETED: "bg-danger text-white border-border",
  };

  return (
    <div
      className={`inline-block px-[5px] py-[2px] text-xs  font-medium rounded-lg border ${typeStyles[status]}`}
    >
      {status}
    </div>
  );
}
