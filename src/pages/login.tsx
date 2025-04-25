import { InputField, Button } from "@/components";
import { useForm, SubmitHandler } from "react-hook-form";
import { loginServiceCall } from "@/services/userService";
import { useAuthStore } from "@/store/authstore";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { checkAuthServiceCall } from "@/services";

type TLogin = {
  email: string;
  password: string;
};

export default function Login() {
  const router = useRouter();
  const { register, handleSubmit } = useForm<TLogin>();
  const { login } = useAuthStore();

  useEffect(() => {
    const handleAuth = async () => {
      const res = await checkAuthServiceCall();

      if (!res.error) router.push("./");

      return;
    };

    handleAuth();
  }, [router]);

  const onSubmit: SubmitHandler<TLogin> = async (data) => {
    try {
      const loginRes = await loginServiceCall(data.email, data.password);
      if (!loginRes.error) {
        login(loginRes.data.user, loginRes.data.token);
        router.push("./");
      }
    } catch {
      console.log("here we are");
    }
  };

  return (
    <div className="h-[100vh] w-full bg-accent flex items-center justify-center">
      <div className="bg-white p-10 flex flex-col min-w-[490px] rounded-md px-[71px] py-[61px]">
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col gap-[41px]"
        >
          <div className="flex justify-center flex-col w-full gap-[9px] items-center">
            <h1 className="text-xl"> Welcome back</h1>
            <p className="text-primary">Enter your credentials to login</p>
          </div>
          <div className="flex justify-center flex-col gap-[23px]">
            <InputField
              label="Email"
              {...register("email")}
              placeholder="Email"
            />
            <InputField
              placeholder="Password"
              label="Password"
              {...register("password")}
              type="password"
            />
            <Button type="submit">Login</Button>
          </div>
          <div className="w-full flex justify-center text-primary">
            <a>Forgot your password ?</a>
          </div>
        </form>
      </div>
    </div>
  );
}
