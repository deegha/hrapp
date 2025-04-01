import Link from "next/link";
import { useRouter } from "next/router";
import { DollarSign, Home, User } from "react-feather";

const navItems = [
  {
    name: "Home",
    url: "/",
    icon: Home,
  },
  {
    name: "Pay Sheets",
    url: "/pay-sheets",
    icon: DollarSign,
  },
  {
    name: "My Profiles",
    url: "/my-profiles",
    icon: User,
  },
];

export const Navigation = () => {
  const router = useRouter();

  return (
    <div className="flex flex-col">
      {navItems.map((items) => {
        return (
          <Link
            href={items.url}
            key={items.url}
            className={`${router.pathname === items.url && "text-tBase bg-bgPrimary"} uppercase hover:text-tHover p-2 text-sm`}
          >
            {items.name}
          </Link>
        );
      })}
    </div>
  );
};
