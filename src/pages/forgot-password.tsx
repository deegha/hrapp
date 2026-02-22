import {InputField, Button} from "@/components";
import {useForm, SubmitHandler} from "react-hook-form";
import {forgotPasswordService} from "@/services/passwordService";
import {useState} from "react";
import {useNotificationStore} from "@/store/notificationStore";
import Link from "next/link";

type TForgotPassword = {
  email: string;
};

export default function ForgotPassword() {
  const {register, handleSubmit} = useForm<TForgotPassword>();
  const {showNotification} = useNotificationStore();
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const onSubmit: SubmitHandler<TForgotPassword> = async (data) => {
    setLoading(true);
    try {
      const response = await forgotPasswordService(data.email);

      if (response.error) {
        showNotification({
          message: "Error sending reset email",
          type: "error",
        });
      } else {
        setEmailSent(true);
        showNotification({
          message: "Password reset email sent successfully",
          type: "success",
        });
      }
    } catch {
      showNotification({
        message: "Error sending reset email",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  if (emailSent) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-accent">
        <div className="flex min-w-[490px] flex-col rounded-md bg-white p-10 px-[71px] py-[61px]">
          <div className="flex w-full flex-col items-center justify-center gap-[20px]">
            <h1 className="text-xl">Email Sent</h1>
            <p className="text-center text-primary">
              We have sent a password reset link to your email address. Please check your email and
              follow the instructions.
            </p>
            <Link href="/login" className="text-primary hover:underline">
              Back to Login
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
            <h1 className="text-xl">Forgot Password</h1>
            <p className="text-primary">Enter your email address to reset your password</p>
          </div>
          <div className="flex flex-col justify-center gap-[23px]">
            <InputField
              label="Email"
              {...register("email", {required: true})}
              placeholder="Enter your email address"
              type="email"
            />
            <Button loading={loading} type="submit">
              Send Reset Link
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
