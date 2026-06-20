import {useRouter} from "next/router";
import {useEffect, useState} from "react";
import {Grid, LogOut, Menu, User, Users, X} from "react-feather";
import Link from "next/link";
import {adminCheckAuthServiceCall} from "@/services/adminService";
import {useAdminAuthStore, initializeAdminAuthStore} from "@/store/adminAuthStore";

interface IAdminNavItem {
  name: string;
  url: string;
  icon: React.ReactNode;
}

const adminNavItems: IAdminNavItem[] = [
  {name: "Organizations", url: "/admin-panel", icon: <Grid size={15} />},
  {name: "Ops Users", url: "/admin-panel/users", icon: <Users size={15} />},
  {name: "My Profile", url: "/admin-panel/profile", icon: <User size={15} />},
];

function AdminNavigation() {
  const router = useRouter();

  return (
    <div className="flex min-w-[163px] flex-col gap-2">
      {adminNavItems.map((item) => {
        const isSelected =
          item.url === "/admin-panel"
            ? router.pathname === item.url ||
              router.pathname.startsWith("/admin-panel/organizations")
            : router.pathname === item.url || router.pathname.startsWith(item.url + "/");
        return (
          <Link
            href={item.url}
            key={item.url}
            className={`${
              isSelected ? "rounded-md bg-primary text-black" : "text-textSecondary"
            } hover:text-tHover flex gap-2 p-2 text-xs font-semibold uppercase`}
          >
            {item.icon}
            <p>{item.name}</p>
          </Link>
        );
      })}
    </div>
  );
}

export function AdminLayout({children}: {children: React.ReactNode}) {
  const router = useRouter();
  const {user, logout} = useAdminAuthStore();
  const [showMenu, setShowMenu] = useState(false);

  useEffect(() => {
    initializeAdminAuthStore();

    const handleAuth = async () => {
      try {
        const res = await adminCheckAuthServiceCall();
        if (res.error) {
          router.push("/admin-panel/login");
        }
      } catch {
        router.push("/admin-panel/login");
      }
    };

    handleAuth();
  }, [router]);

  function handleLogout() {
    logout();
    router.push("/admin-panel/login");
  }

  return (
    <div className="flex h-screen w-full flex-col md:flex-row">
      {/* Desktop Sidebar */}
      <div className="fixed hidden h-screen w-[207px] flex-col justify-between gap-10 border-r border-border md:flex">
        <div className="flex h-[88px] flex-col items-center justify-center gap-1 border-b border-border">
          <span className="text-xs font-semibold uppercase tracking-widest text-textSecondary">
            Ops Admin
          </span>
          <span className="text-sm font-semibold text-textPrimary">Admin Panel</span>
        </div>
        <div className="flex flex-[70%] flex-col items-center justify-between gap-2 overflow-y-auto">
          <AdminNavigation />
        </div>
        <div className="flex h-[88px] flex-col items-center justify-center gap-1 border-t border-border px-4">
          <span className="max-w-full truncate text-xs font-semibold text-textPrimary">
            {user?.firstName} {user?.lastName}
          </span>
          <span className="max-w-full truncate text-xxs text-textSecondary">{user?.email}</span>
          <button
            className="mt-1 flex cursor-pointer items-center gap-2 text-xs font-semibold uppercase text-textSecondary hover:text-textPrimary"
            onClick={handleLogout}
          >
            <LogOut size={13} />
            Logout
          </button>
        </div>
      </div>

      {/* Mobile Top Bar */}
      <div className="flex w-full items-center justify-between border-b border-border p-3 text-textSecondary md:hidden">
        <span className="text-sm font-semibold">Admin Panel</span>
        <Menu onClick={() => setShowMenu(true)} />
      </div>

      {/* Mobile Slide-in Drawer */}
      <div className="pointer-events-none fixed inset-0 z-50 md:hidden">
        <div
          className={`absolute inset-0 bg-black/50 transition-opacity duration-300 ${
            showMenu ? "pointer-events-auto opacity-100" : "opacity-0"
          }`}
          onClick={() => setShowMenu(false)}
        />
        <div
          className={`absolute left-0 top-0 h-full w-[250px] bg-white shadow-lg transition-transform duration-300 ease-in-out ${
            showMenu ? "translate-x-0" : "-translate-x-full"
          } pointer-events-auto`}
        >
          <div className="flex h-[88px] items-center justify-between border-b border-border px-4">
            <span className="text-sm font-semibold">Admin Panel</span>
            <X onClick={() => setShowMenu(false)} />
          </div>
          <div className="h-[calc(100%-88px)] overflow-y-auto p-4">
            <AdminNavigation />
            <button
              className="mt-6 flex cursor-pointer items-center gap-2 text-xs font-semibold uppercase hover:font-bold"
              onClick={handleLogout}
            >
              <LogOut size={13} />
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="ml-0 w-full md:ml-[207px]">{children}</div>
    </div>
  );
}
