import {TGenericStatus} from "@/types";
import {StatusTag} from "../statusTag/statusTag";

interface IListItems {
  title: string | React.ReactNode;
  content: React.ReactNode;
  status?: string | TGenericStatus;
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

      {/* Right side: status tag and any custom action area (aligned center) */}
      <div className="flex items-center gap-3 text-sm">
        {props.status && <StatusTag status={props.status} />}
        {props.actionArea && <div className="flex items-center gap-2">{props.actionArea}</div>}
      </div>
    </div>
  );
}
