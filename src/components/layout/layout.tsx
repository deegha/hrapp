import { Navigation } from "@/components";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { checkAuthServiceCall, logOutServiceCall } from "@/services/";
import { useAuthStore } from "@/store/authstore";
import { LogOut } from "react-feather";

interface IPrps {
  children: React.ReactNode;
}

export function Layout({ children }: IPrps) {
  const router = useRouter();
  const { logout } = useAuthStore();

  useEffect(() => {
    const handleAuth = async () => {
      const res = await checkAuthServiceCall();

      if (res.error) {
        logout();
        router.push("./login");
      }

      return;
    };

    handleAuth();
  }, [logout, router]);

  async function doLogout() {
    await logOutServiceCall();
    logout();

    router.push("./login");
  }

  return (
    <div className="flex w-full h-[100hv]">
      <div className="w-[207px] flex flex-col gap-10 border-r border-border h-[100vh] justify-between">
        <div className="flex items-center h-[88px] justify-center border-b border-border font-semibold">
          Macro HR
        </div>
        <div className="flex items-start justify-center flex-[70%] ">
          <Navigation />
        </div>
        <div className="flex items-center h-[88px] justify-center border-t border-border ">
          <div
            className="uppercase text-sm font-semibold cursor-pointer flex items-center gap-2 text-danger hover:font-bold"
            onClick={doLogout}
          >
            <LogOut size={15} />
            Logout
          </div>
        </div>
      </div>
      <div className="w-full">{children}</div>
    </div>
  );
}
