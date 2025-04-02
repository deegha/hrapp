import Link from "next/link";
import { useRouter } from "next/router";
import { DollarSign, Home, User, UserMinus } from "react-feather";

const navItems = [
  {
    name: "Home",
    url: "/",
    icon: Home,
  },
  {
    name: "Leave",
    url: "/leave-management",
    icon: UserMinus,
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
    <div className="flex flex-col gap-2">
      {navItems.map((item) => {
        const Icons = item.icon;
        return (
          <Link
            href={item.url}
            key={item.url}
            className={` ${router.pathname === item.url ? " bg-primary rounded-md text-black" : "text-textSecondary"} text-xs uppercase hover:text-tHover p-2  flex gap-2 font-semibold`}
          >
            <Icons size={15} />
            <p>{item.name}</p>
          </Link>
        );
      })}
    </div>
  );
};
