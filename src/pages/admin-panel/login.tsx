import {InputField, Button} from "@/components";
import {useForm, SubmitHandler} from "react-hook-form";
import {adminLoginServiceCall} from "@/services/adminService";
import {useAdminAuthStore} from "@/store/adminAuthStore";
import {useRouter} from "next/router";
import {useEffect, useState} from "react";
import {adminCheckAuthServiceCall} from "@/services/adminService";
import {useNotificationStore} from "@/store/notificationStore";

type TAdminLogin = {
  email: string;
  password: string;
};

export default function AdminLogin() {
  const router = useRouter();
  const {register, handleSubmit} = useForm<TAdminLogin>();
  const {login} = useAdminAuthStore();
  const {showNotification} = useNotificationStore();
  const [loading, setIsLoading] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await adminCheckAuthServiceCall();
        if (!res.error) router.push("/admin-panel");
      } catch {}
    };
    checkAuth();
  }, [router]);

  const onSubmit: SubmitHandler<TAdminLogin> = async (data) => {
    setIsLoading(true);
    try {
      const res = await adminLoginServiceCall(data.email, data.password);

      if (res.error) {
        showNotification({message: "Login failed", type: "error"});
        setIsLoading(false);
        return;
      }

      login(res.data.user, res.data.token);
      showNotification({message: "Login successful", type: "success"});
      router.push("/admin-panel");
    } catch {
      showNotification({message: "Login failed. Check your credentials.", type: "error"});
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex w-full items-center justify-center md:h-screen md:bg-gray-100">
      <div className="flex w-[490px] flex-col rounded-md bg-white p-10 shadow-md md:px-[71px] md:py-[61px]">
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-[41px]">
          <div className="flex w-full flex-col items-center justify-center gap-[9px]">
            <div className="mb-2 flex size-12 items-center justify-center rounded-full bg-[#80CBC4]">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="size-6 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            </div>
            <h1 className="text-md md:text-xl">Admin Panel</h1>
            <p className="text-sm text-gray-500">Restricted to OPS_ADMIN users only</p>
          </div>
          <div className="flex flex-col justify-center gap-[23px]">
            <InputField label="Email" {...register("email")} placeholder="admin@example.com" />
            <InputField
              placeholder="Password"
              label="Password"
              {...register("password")}
              type="password"
            />
            <Button loading={loading} type="submit">
              Sign In
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
