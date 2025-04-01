import { Navigation } from "@/components";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { checkAuthServiceCall, logOutServiceCall } from "@/services/";

interface IPrps {
  children: React.ReactNode;
}

export function Layout({ children }: IPrps) {
  const router = useRouter();

  useEffect(() => {
    const handleAuth = async () => {
      const res = await checkAuthServiceCall();

      if (res.error) router.push("./login");

      return;
    };

    handleAuth();
  }, []);

  async function logout() {
    await logOutServiceCall();
    await localStorage.removeItem("token");

    router.push("./login");
  }

  return (
    <div className="flex w-full h-[100hv]">
      <div className="max-w-[207px] flex flex-col gap-10">
        <div className="flex items-center h-[88px] justify-center">
          Macro HR
        </div>
        <div className="flex items-center justify-center">
          <Navigation />
        </div>
        <div className="flex items-center">
          <div
            className="uppercase hover:text-tHover p-2 text-sm cursor-pointer"
            onClick={logout}
          >
            Logout
          </div>
        </div>
      </div>
      <div className="">{children}</div>
    </div>
  );
}
