import Link from "next/link";
import { useRouter } from "next/router";
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
import { getNavigationItems } from "@/services/uiService";

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

  const {
    data: navItems,
    error,
    isLoading,
  } = useSWR("/navigation", getNavigationItems);
  if ((!navItems && !isLoading) || error || navItems?.error) return null;

  return (
    <div className="flex flex-col gap-2">
      {isLoading
        ? // Skeleton Loader
          Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="animate-pulse flex gap-2 items-center bg-gray-200 rounded-md p-2 h-6"
            >
              <div className="w-4 h-4 bg-gray-300 rounded-md" />
              <div className="w-20 h-3 bg-gray-300 rounded-md" />
            </div>
          ))
        : // Actual Navigation Items
          navItems?.data.map((item) => {
            const IconComponent = iconMap[item.icon] || null;
            const isSelected =
              router.pathname === item.url ||
              router.pathname.startsWith(item.url + "/");
            return (
              <Link
                href={item.url}
                key={item.url}
                className={` ${
                  isSelected
                    ? "bg-primary rounded-md text-black "
                    : "text-textSecondary"
                } text-xs uppercase hover:text-tHover p-2 flex gap-2 font-semibold`}
              >
                {IconComponent && <IconComponent size={15} />}
                <p>{item.name}</p>
              </Link>
            );
          })}
    </div>
  );
};
