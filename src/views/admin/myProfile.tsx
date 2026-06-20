import {useEffect} from "react";
import {useForm} from "react-hook-form";
import {InputField, Button} from "@/components";
import {
  fetchMyAdminProfile,
  updateMyAdminProfile,
  changeAdminPassword,
  TUpdateMyProfilePayload,
  TChangePasswordPayload,
} from "@/services/adminService";
import {useNotificationStore} from "@/store/notificationStore";
import {useAdminAuthStore} from "@/store/adminAuthStore";
import useSWR, {mutate} from "swr";

type TProfileForm = {firstName: string; lastName: string; email: string};
type TPasswordForm = {currentPassword: string; newPassword: string; confirmPassword: string};

export function MyAdminProfile() {
  const {showNotification} = useNotificationStore();
  const {login, token} = useAdminAuthStore();

  const {data, isLoading} = useSWR("admin-my-profile", fetchMyAdminProfile);
  const profile = data?.data;

  const profileForm = useForm<TProfileForm>();
  const passwordForm = useForm<TPasswordForm>();

  useEffect(() => {
    if (profile) {
      profileForm.reset({
        firstName: profile.firstName,
        lastName: profile.lastName,
        email: profile.email,
      });
    }
  }, [profile, profileForm]);

  const onProfileSubmit = async (values: TProfileForm) => {
    try {
      const payload: TUpdateMyProfilePayload = values;
      const res = await updateMyAdminProfile(payload);
      if (res.error) {
        showNotification({type: "error", message: "Failed to update profile"});
        return;
      }
      showNotification({type: "success", message: "Profile updated"});
      mutate("admin-my-profile");
      if (token) {
        login(res.data, token);
      }
    } catch {
      showNotification({type: "error", message: "Something went wrong"});
    }
  };

  const onPasswordSubmit = async (values: TPasswordForm) => {
    if (values.newPassword !== values.confirmPassword) {
      passwordForm.setError("confirmPassword", {message: "Passwords do not match"});
      return;
    }
    try {
      const payload: TChangePasswordPayload = {
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      };
      const res = await changeAdminPassword(payload);
      if (res.error) {
        showNotification({type: "error", message: String(res.data)});
        return;
      }
      showNotification({type: "success", message: "Password changed successfully"});
      passwordForm.reset();
    } catch {
      showNotification({type: "error", message: "Something went wrong"});
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4 p-6">
        {Array.from({length: 3}).map((_, i) => (
          <div key={i} className="h-10 animate-pulse rounded-md bg-gray-200" />
        ))}
      </div>
    );
  }

  return (
    <div className="flex max-w-2xl flex-col gap-8 p-[25px]">
      {/* Personal details */}
      <section className="rounded-xl border border-border bg-white p-6 shadow-sm">
        <h2 className="mb-5 text-sm font-semibold uppercase text-textSecondary">
          Personal Details
        </h2>
        <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="flex flex-col gap-5">
          <div className="flex flex-col gap-1">
            <InputField
              label="First Name"
              placeholder="First name"
              {...profileForm.register("firstName", {required: "Required"})}
            />
            {profileForm.formState.errors.firstName && (
              <span className="text-xs font-semibold text-danger">
                {profileForm.formState.errors.firstName.message}
              </span>
            )}
          </div>

          <div className="flex flex-col gap-1">
            <InputField
              label="Last Name"
              placeholder="Last name"
              {...profileForm.register("lastName", {required: "Required"})}
            />
            {profileForm.formState.errors.lastName && (
              <span className="text-xs font-semibold text-danger">
                {profileForm.formState.errors.lastName.message}
              </span>
            )}
          </div>

          <div className="flex flex-col gap-1">
            <InputField
              label="Email"
              type="email"
              placeholder="email@example.com"
              {...profileForm.register("email", {required: "Required"})}
            />
            {profileForm.formState.errors.email && (
              <span className="text-xs font-semibold text-danger">
                {profileForm.formState.errors.email.message}
              </span>
            )}
          </div>

          <Button type="submit" loading={profileForm.formState.isSubmitting}>
            Save Changes
          </Button>
        </form>
      </section>

      {/* Change password */}
      <section className="rounded-xl border border-border bg-white p-6 shadow-sm">
        <h2 className="mb-5 text-sm font-semibold uppercase text-textSecondary">Change Password</h2>
        <form
          onSubmit={passwordForm.handleSubmit(onPasswordSubmit)}
          className="flex flex-col gap-5"
        >
          <div className="flex flex-col gap-1">
            <InputField
              label="Current Password"
              type="password"
              placeholder="Current password"
              {...passwordForm.register("currentPassword", {required: "Required"})}
            />
            {passwordForm.formState.errors.currentPassword && (
              <span className="text-xs font-semibold text-danger">
                {passwordForm.formState.errors.currentPassword.message}
              </span>
            )}
          </div>

          <div className="flex flex-col gap-1">
            <InputField
              label="New Password"
              type="password"
              placeholder="Min 8 characters"
              {...passwordForm.register("newPassword", {
                required: "Required",
                minLength: {value: 8, message: "At least 8 characters"},
              })}
            />
            {passwordForm.formState.errors.newPassword && (
              <span className="text-xs font-semibold text-danger">
                {passwordForm.formState.errors.newPassword.message}
              </span>
            )}
          </div>

          <div className="flex flex-col gap-1">
            <InputField
              label="Confirm New Password"
              type="password"
              placeholder="Repeat new password"
              {...passwordForm.register("confirmPassword", {required: "Required"})}
            />
            {passwordForm.formState.errors.confirmPassword && (
              <span className="text-xs font-semibold text-danger">
                {passwordForm.formState.errors.confirmPassword.message}
              </span>
            )}
          </div>

          <Button type="submit" loading={passwordForm.formState.isSubmitting}>
            Change Password
          </Button>
        </form>
      </section>
    </div>
  );
}
