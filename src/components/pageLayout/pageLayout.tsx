interface IProps {
  pageName: string;
  actionButton: React.ReactNode;
  children: React.ReactNode;
}

export function PageLayout({ pageName, actionButton, children }: IProps) {
  return (
    <div className="flex w-full flex-col gap-[40px] p-[25px]">
      <div className="w-full flex justify-between items-center">
        <h2 className="text-sm font-semibold">{pageName}</h2>
        <div>{actionButton}</div>
      </div>
      <div className="w-full">{children}</div>
    </div>
  );
}
