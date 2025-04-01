import { InputField, Button } from "@/components";
import { useForm, SubmitHandler } from "react-hook-form";
import { loginServiceCall } from "@/services/userService";
import { useAuthStore } from "@/store/authstore";
import { useRouter } from "next/router";
import { useEffect } from "react";

type TLogin = {
  email: string;
  password: string;
};

export default function Login() {
  const router = useRouter();
  const { register, handleSubmit } = useForm<TLogin>();
  const { login, isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated) router.push("/");
  }, [isAuthenticated, router]);

  const onSubmit: SubmitHandler<TLogin> = async (data) => {
    try {
      const loginRes = await loginServiceCall(data.email, data.password);
      login(loginRes.data.user, loginRes.data.token);
    } catch {
      console.log("here we are");
    }
  };

  return (
    <div className="h-[100vh] w-full bg-secondary flex items-center justify-center">
      <div className="bg-white p-10 flex flex-col">
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="flex justify-center">
            <h1 className="text-xlg"> Welcome back</h1>
            <p>Enter your credentials to login</p>
          </div>
          <div className="flex justify-center flex-col gap-5">
            <InputField label="Email" {...register("email")} />
            <InputField
              label="Password"
              {...register("password")}
              type="password"
            />
            <Button type="submit">Login</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
