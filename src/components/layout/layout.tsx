import { Navigation } from "@/components";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { checkAuthServiceCall, logOutServiceCall } from "@/services/";
import { useAuthStore } from "@/store/authstore";
import { LogOut } from "react-feather";
import { useNotificationStore } from "@/store/notificationStore";
interface IPrps {
  children: React.ReactNode;
}

export function Layout({ children }: IPrps) {
  const router = useRouter();
  const { logout } = useAuthStore();
  const { showNotification } = useNotificationStore();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    const handleAuth = async () => {
      const res = await checkAuthServiceCall();

      if (res.error) {
        showNotification({
          type: "error",
          message: res.data,
        });
        logout();
        router.push("/login");
      }
      setLoading(false);
      return;
    };

    handleAuth();
  }, [logout, router, showNotification]);

  async function doLogout() {
    await logOutServiceCall();
    logout();

    router.push("/login");
  }

  return (
    <div className="flex w-full h-[100hv]">
      <div className="w-[207px] flex flex-col gap-10 border-r border-border h-[100vh] justify-between fixed">
        <div className="flex items-center h-[88px] justify-center border-b border-border font-semibold ">
          PODTALENT.net
        </div>
        <div className="flex items-start justify-center flex-[70%] ">
          <Navigation />
        </div>
        <div className="flex items-center h-[88px] justify-center border-t border-border  ">
          <div
            className="uppercase text-sm font-semibold cursor-pointer flex items-center gap-2  hover:font-bold"
            onClick={doLogout}
          >
            <LogOut size={15} />
            Logout
          </div>
        </div>
      </div>
      <div className="w-full ml-[207px]">{children}</div>
    </div>
  );
}
