import {InputField, Button} from "@/components";
import {useForm, SubmitHandler} from "react-hook-form";
import {loginServiceCall} from "@/services/userService";
import {useAuthStore} from "@/store/authstore";
import {useRouter} from "next/router";
import {useEffect, useState} from "react";
import {checkAuthServiceCall} from "@/services";
import zipy from "zipyai";
import {useNotificationStore} from "@/store/notificationStore";
import Link from "next/link";

type TLogin = {
  email: string;
  password: string;
};

export default function Login() {
  const router = useRouter();
  const {register, handleSubmit} = useForm<TLogin>();
  const {login} = useAuthStore();
  const {showNotification} = useNotificationStore();
  const [loading, setIsLoading] = useState(false);

  useEffect(() => {
    const handleAuth = async () => {
      try {
        const res = await checkAuthServiceCall();

        if (!res.error) router.push("./");
      } catch {}
    };

    handleAuth();
  }, [router]);

  const onSubmit: SubmitHandler<TLogin> = async (data) => {
    setIsLoading(true);
    try {
      const loginRes = await loginServiceCall(data.email, data.password);

      const user = loginRes.data.user;

      zipy.identify(user.email, {
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
      });

      if (loginRes.error) {
        setIsLoading(false);
        showNotification({
          message: `Login failed`,
          type: "error",
        });
        return;
      }

      showNotification({
        message: "Login Successful",
        type: "success",
      });

      setIsLoading(false);
      login(loginRes.data.user, loginRes.data.token);
      router.push("./");
    } catch (e) {
      setIsLoading(false);
      showNotification({
        message: "Login failed",
        type: "error",
      });
      console.log(e);
    }
  };

  return (
    <div className="flex h-screen w-full items-center justify-center md:bg-accent">
      <div className="flex w-[490px] flex-col rounded-md bg-white p-10 px-[71px] py-[61px]">
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-[41px]">
          <div className="flex w-full flex-col items-center justify-center gap-[9px]">
            <h1 className="text-xl"> Welcome back</h1>
            <p className="text-primary">Enter your credentials to login</p>
          </div>
          <div className="flex flex-col justify-center gap-[23px]">
            <InputField label="Email" {...register("email")} placeholder="Email" />
            <InputField
              placeholder="Password"
              label="Password"
              {...register("password")}
              type="password"
            />
            <Button loading={loading} type="submit">
              Login
            </Button>
          </div>
          <div className="flex w-full justify-center text-primary">
            <Link href="/forgot-password" className="hover:underline">
              Forgot your password ?
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
