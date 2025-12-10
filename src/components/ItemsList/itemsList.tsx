import {TGenericStatus} from "@/types";
import {StatusTag} from "../statusTag/statusTag";

interface IListItems {
  title: string | React.ReactNode;
  content: React.ReactNode;
  status?: TGenericStatus;
  onClick?: () => void;
  actionArea?: React.ReactNode;
}

export function ItemsList(props: IListItems) {
  return (
    <div
      onClick={props.onClick}
      className={`flex ${props.onClick && "cursor-pointer"} justify-between border-t border-border py-3`}
    >
      <div>
        <div className="text-sm font-semibold">{props.title}</div>
        <div className="flex gap-2 text-sm text-textSecondary">{props.content}</div>
      </div>
      <div className="text-sm">
        {props.status && <StatusTag status={props.status} />}
        {props.actionArea && props.actionArea}
      </div>
    </div>
  );
}
