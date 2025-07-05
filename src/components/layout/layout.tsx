import {Navigation} from "@/components";
import {useRouter} from "next/router";
import {useEffect, useState} from "react";
import {checkAuthServiceCall, logOutServiceCall} from "@/services/";
import {useAuthStore} from "@/store/authstore";
import {LogOut, Menu, X} from "react-feather";
import {useNotificationStore} from "@/store/notificationStore";
import Image from "next/image";

interface IPrps {
  children: React.ReactNode;
}

export function Layout({children}: IPrps) {
  const router = useRouter();
  const {logout} = useAuthStore();
  const {showNotification} = useNotificationStore();
  const [showMenu, setShowMenu] = useState(false);

  useEffect(() => {
    const handleAuth = async () => {
      try {
        const res = await checkAuthServiceCall();

        if (res.error) {
          showNotification({
            type: "error",
            message: res.data,
          });
          logout();
          router.push("/login");
        }
      } catch {}
    };

    handleAuth();
  }, [logout, router, showNotification]);

  async function doLogout() {
    try {
      await logOutServiceCall();
    } catch {
      // Continue logout even if API fails
    }
    logout();
    router.push("/login");
  }

  console.log(showMenu, "showMenu");

  return (
    <div className="flex h-screen w-full flex-col md:flex-row">
      {/* Desktop Navigation */}
      <div className="fixed hidden h-screen w-[207px] flex-col justify-between gap-10 border-r border-border md:flex">
        <div className="flex h-[88px] items-center justify-center border-b border-border font-semibold">
          <Image
            src="https://res.cloudinary.com/duqpgdc9v/image/upload/v1749524495/POD_Talent_logo-1_en5z24.png"
            width={70}
            height={70}
            alt="podtalent.net"
          />
        </div>
        <div className="flex flex-[70%] flex-col items-center justify-between gap-2 overflow-y-auto">
          <Navigation />
        </div>
        <div className="flex h-[88px] flex-col items-center justify-center gap-2 border-t border-border">
          <div
            className="flex cursor-pointer items-center gap-2 text-sm font-semibold uppercase hover:font-bold"
            onClick={doLogout}
          >
            <LogOut size={15} />
            Logout
          </div>
        </div>
      </div>

      {/* Mobile Top Bar */}
      <div className="flex w-full items-center justify-end border-b border-border p-3 text-textSecondary md:hidden">
        <Menu onClick={() => setShowMenu(true)} />
      </div>

      {/* Slide-in Mobile Drawer */}
      <div className={`pointer-events-none fixed inset-0 z-50 md:hidden`}>
        {/* Backdrop */}
        <div
          className={`absolute inset-0 bg-black/50 transition-opacity duration-300 ${
            showMenu ? "pointer-events-auto opacity-100" : "opacity-0"
          }`}
          onClick={() => setShowMenu(false)}
        />
        {/* Drawer */}
        <div
          className={`absolute left-0 top-0 h-full w-[250px] bg-white shadow-lg transition-transform duration-300 ease-in-out ${
            showMenu ? "translate-x-0" : "-translate-x-full"
          } pointer-events-auto`}
        >
          <div className="flex h-[88px] items-center justify-between border-b border-border px-4">
            <Image
              src="https://res.cloudinary.com/duqpgdc9v/image/upload/v1749524495/POD_Talent_logo-1_en5z24.png"
              width={50}
              height={50}
              alt="podtalent.net"
            />
            <X onClick={() => setShowMenu(false)} />
          </div>
          <div className="h-[calc(100%-88px)] overflow-y-auto p-4">
            <Navigation />
            <div
              className="mt-6 flex cursor-pointer items-center gap-2 text-sm font-semibold uppercase hover:font-bold"
              onClick={doLogout}
            >
              <LogOut size={15} />
              Logout
            </div>
          </div>
        </div>
      </div>

      <div className="ml-0 w-full sm:ml-[207px]">{children}</div>
    </div>
  );
}
