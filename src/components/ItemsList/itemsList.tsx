import {TGenericStatus} from "@/types";
import {StatusTag} from "../statusTag/statusTag";

interface IListItems {
  title: string | React.ReactNode;
  content: React.ReactNode;
  status: TGenericStatus;
  onClick: () => void;
}

export function ItemsList(props: IListItems) {
  return (
    <div
      onClick={props.onClick}
      className="flex cursor-pointer justify-between border-t border-border py-3"
    >
      <div>
        <div className="text-sm font-semibold">{props.title}</div>
        <div className="flex gap-2 text-sm text-textSecondary">{props.content}</div>
      </div>
      <div className="text-sm">
        <StatusTag status={props.status} />
      </div>
    </div>
  );
}
