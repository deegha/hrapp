import {InputField, Button} from "@/components";
import {useForm, SubmitHandler} from "react-hook-form";
import {resetPasswordService} from "@/services/passwordService";
import {useState, useEffect} from "react";
import {useNotificationStore} from "@/store/notificationStore";
import {useRouter} from "next/router";
import Link from "next/link";

type TResetPassword = {
  password: string;
  confirmPassword: string;
};

export default function ResetPassword() {
  const {register, handleSubmit} = useForm<TResetPassword>();
  const {showNotification} = useNotificationStore();
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (router.query.token) {
      setToken(router.query.token as string);
    }
  }, [router.query]);

  const onSubmit: SubmitHandler<TResetPassword> = async (data) => {
    if (data.password !== data.confirmPassword) {
      showNotification({
        message: "Passwords do not match",
        type: "error",
      });
      return;
    }

    if (!token) {
      showNotification({
        message: "Invalid reset token",
        type: "error",
      });
      return;
    }

    setLoading(true);
    try {
      const response = await resetPasswordService(token, data.password);

      if (response.error) {
        showNotification({
          message: "Error resetting password",
          type: "error",
        });
      } else {
        showNotification({
          message: "Password reset successfully",
          type: "success",
        });
        router.push("/login");
      }
    } catch {
      showNotification({
        message: "Error resetting password",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-accent">
        <div className="flex min-w-[490px] flex-col rounded-md bg-white p-10 px-[71px] py-[61px]">
          <div className="flex w-full flex-col items-center justify-center gap-[20px]">
            <h1 className="text-xl">Invalid Link</h1>
            <p className="text-center text-primary">
              This password reset link is invalid or has expired.
            </p>
            <Link href="/forgot-password" className="text-primary hover:underline">
              Request New Reset Link
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full items-center justify-center bg-accent">
      <div className="flex min-w-[490px] flex-col rounded-md bg-white p-10 px-[71px] py-[61px]">
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-[41px]">
          <div className="flex w-full flex-col items-center justify-center gap-[9px]">
            <h1 className="text-xl">Reset Password</h1>
            <p className="text-primary">Enter your new password</p>
          </div>
          <div className="flex flex-col justify-center gap-[23px]">
            <InputField
              label="New Password"
              {...register("password", {required: true, minLength: 6})}
              placeholder="Enter new password"
              type="password"
            />
            <InputField
              label="Confirm Password"
              {...register("confirmPassword", {required: true})}
              placeholder="Confirm new password"
              type="password"
            />
            <Button loading={loading} type="submit">
              Reset Password
            </Button>
          </div>
          <div className="flex w-full justify-center">
            <Link href="/login" className="text-primary hover:underline">
              Back to Login
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
