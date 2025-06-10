import Link from "next/link";
import {useRouter} from "next/router";
import {
  CheckSquare,
  DollarSign,
  FileText,
  Home,
  Icon,
  User,
  UserMinus,
  Paperclip,
  Users,
} from "react-feather";
import useSWR from "swr";
import {getNavigationItems} from "@/services/uiService";

const iconMap: Record<string, Icon> = {
  Home,
  UserMinus,
  DollarSign,
  User,
  FileText,
  CheckSquare,
  Paperclip,
  Users,
};

export const Navigation = () => {
  const router = useRouter();

  const {data: navItems, error, isLoading} = useSWR("/navigation", getNavigationItems);

  if ((!navItems && !isLoading) || error || navItems?.error) return null;

  return (
    <div className="flex min-w-[163px] flex-col gap-2">
      {isLoading
        ? // Skeleton Loader
          Array.from({length: 6}).map((_, index) => (
            <div
              key={index}
              className={`flex h-[34px] w-[163px] animate-pulse items-center gap-2 rounded-md ${index === 0 && "bg-gray-200"} p-2`}
            >
              <div className="size-4 rounded-md bg-gray-300" />
              <div className="h-3 w-20 rounded-md bg-gray-300" />
            </div>
          ))
        : // Actual Navigation Items
          navItems?.data.map((item) => {
            const IconComponent = iconMap[item.icon] || null;
            const isSelected =
              router.pathname === item.url || router.pathname.startsWith(item.url + "/");
            return (
              <Link
                href={item.url}
                key={item.url}
                className={` ${
                  isSelected ? "rounded-md bg-primary text-black" : "text-textSecondary"
                } hover:text-tHover flex gap-2 p-2 text-xs font-semibold uppercase`}
              >
                {IconComponent && <IconComponent size={15} />}
                <p>{item.name}</p>
              </Link>
            );
          })}
    </div>
  );
};
