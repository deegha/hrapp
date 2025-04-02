import { useRouter } from "next/navigation";
import { ArrowLeft } from "react-feather";
interface IProps {
  pageName: string;
  actionButton?: React.ReactNode;
  children: React.ReactNode;
  enableBack?: boolean;
}

export function PageLayout({
  pageName,
  actionButton,
  children,
  enableBack,
}: IProps) {
  const router = useRouter();

  function handleBack() {
    router.back();
  }

  return (
    <div className="flex w-full flex-col gap-[40px] p-[25px]">
      <div className="w-full flex justify-between items-center h-[40px]">
        <div className="flex items-center gap-2 ">
          {enableBack && (
            <ArrowLeft
              size={22}
              className="cursor-pointer"
              onClick={handleBack}
            />
          )}
          <h2 className="text-sm font-semibold">{pageName}</h2>
        </div>
        <div>{actionButton}</div>
      </div>
      <div className="w-full">{children}</div>
    </div>
  );
}
