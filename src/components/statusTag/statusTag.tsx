interface IProps {
  status: string;
  type: "ACTIVE" | "PENDING" | "DELETED" | "CREATED";
}

export function StatusTag({ status, type }: IProps) {
  const typeStyles: Record<IProps["type"], string> = {
    CREATED: "bg-accent text-textPrimary border-border",
    ACTIVE: "bg-primary text-textPrimary border-border",
    PENDING: "bg-secondary text-white border-border",
    DELETED: "bg-danger text-white border-border",
  };

  return (
    <div
      className={`inline-block px-[5px] py-[2px] text-sm lowercase font-medium rounded-lg border ${typeStyles[type]}`}
    >
      {status}
    </div>
  );
}
