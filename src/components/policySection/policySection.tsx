type IPolicyItem = {
  id: number;
  item: string;
  value: React.ReactNode;
  editValue?: React.ReactNode;
};

interface IPolicySection {
  title: string;
  items: Array<IPolicyItem>;
  edit?: boolean;
}

export function PolicySection(props: IPolicySection) {
  return (
    <div className="flex flex-col gap-5">
      <h3 className="text-md font-bold">{props.title}</h3>
      <div className="flex flex-col">
        {props.items.map((item) => (
          <div key={item.id} className="flex items-center gap-5 border-t border-border py-2">
            <div className="w-[350px] text-sm text-textSecondary">{item.item}</div>
            <div className={`text-sm text-black ${props.edit ? "w-[200px]" : "p-2"}`}>
              {props.edit ? item.editValue : item.value}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
