import {TGenericStatus} from "@/types/";
interface IProps {
  status: TGenericStatus;
}

export function StatusTag({status}: IProps) {
  const typeStyles: Record<IProps["status"], string> = {
    PENDING: "bg-secondary text-white",
    APPROVED: "bg-primary text-white",
    DEACTIVATED: "bg-secondary text-white ",
    DELETED: "bg-danger text-white",
    REJECTED: "bg-danger text-white",
  };

  return (
    <div
      className={`inline-block rounded-md px-[6px] py-[2px] text-xxs font-medium ${typeStyles[status]}`}
    >
      {status}
    </div>
  );
}
