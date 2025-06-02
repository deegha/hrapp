import {Navigation} from "@/components";
import {useRouter} from "next/router";
import {useEffect} from "react";
import {checkAuthServiceCall, logOutServiceCall} from "@/services/";
import {useAuthStore} from "@/store/authstore";
import {LogOut} from "react-feather";
import {useNotificationStore} from "@/store/notificationStore";
interface IPrps {
  children: React.ReactNode;
}

export function Layout({children}: IPrps) {
  const router = useRouter();
  const {logout} = useAuthStore();
  const {showNotification} = useNotificationStore();

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

  return (
    <div className="flex h-[100hv] w-full">
      <div className="fixed flex h-screen w-[207px] flex-col justify-between gap-10 border-r border-border">
        <div className="flex h-[88px] items-center justify-center border-b border-border font-semibold">
          PODTALENT.net
        </div>
        <div className="flex flex-[70%] items-start justify-center">
          <Navigation />
        </div>
        <div className="flex h-[88px] items-center justify-center border-t border-border">
          <div
            className="flex cursor-pointer items-center gap-2 text-sm font-semibold uppercase hover:font-bold"
            onClick={doLogout}
          >
            <LogOut size={15} />
            Logout
          </div>
        </div>
      </div>
      <div className="ml-[207px] w-full">{children}</div>
    </div>
  );
}
