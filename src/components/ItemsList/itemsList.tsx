import { TGenericStatus } from "@/types";
import { StatusTag } from "../statusTag/statusTag";

interface IListItems {
  title: string;
  content: React.ReactNode;
  status: TGenericStatus;
  onClick: () => void;
}

export function ItemsList(props: IListItems) {
  return (
    <div
      onClick={props.onClick}
      className="border-border border-t py-3 flex justify-between cursor-pointer"
    >
      <div>
        <p className="text-sm">{props.title}</p>
        <div className="text-sm text-textSecondary flex gap-2">
          {props.content}
        </div>
      </div>
      <div className="text-sm">
        <StatusTag status={props.status} />
      </div>
    </div>
  );
}
