import {usePathname} from "next/navigation";
import Link from "next/link";
import {ChevronRight} from "react-feather";

interface IProps {
  pageName: string;
  actionButton?: React.ReactNode;
  children: React.ReactNode;
}

export function PageLayout({pageName, actionButton, children}: IProps) {
  const pathname = usePathname();

  const pathSegments = pathname.split("/").filter(Boolean);

  return (
    <div className="flex w-full animate-appear flex-col gap-[20px] p-[25px] md:gap-[40px]">
      <div className="flex h-[40px] w-full items-center justify-between">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <h2 className="text-md font-semibold">{pageName}</h2>
          </div>
          {/* Breadcrumbs */}
          <div className="flex items-center gap-2 text-xs text-textSecondary">
            {pathSegments.map((segment, index) => {
              const href = "/" + pathSegments.slice(0, index + 1).join("/");
              const isLast = index === pathSegments.length - 1;
              return (
                <div className="flex items-center gap-1" key={href}>
                  {!isLast ? (
                    <Link href={href} className="hover:text-textHover">
                      {segment}
                    </Link>
                  ) : (
                    <span className="font-semibold text-textPrimary">{segment}</span>
                  )}
                  {!isLast && <ChevronRight size={12} />}
                </div>
              );
            })}
          </div>
        </div>
        <div>{actionButton}</div>
      </div>
      <div className="flex w-full flex-col">{children}</div>
    </div>
  );
}
