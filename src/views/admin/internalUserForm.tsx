import {useEffect} from "react";
import {useForm} from "react-hook-form";
import {InputField, Button} from "@/components";
import {
  TInternalUser,
  createInternalUser,
  updateInternalUser,
  TCreateInternalUserPayload,
  TUpdateInternalUserPayload,
} from "@/services/adminService";
import {useNotificationStore} from "@/store/notificationStore";
import {mutate} from "swr";

type TFormValues = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
};

interface IProps {
  user: TInternalUser | null;
  onClose: () => void;
}

export function InternalUserForm({user, onClose}: IProps) {
  const isEdit = user !== null;
  const {showNotification} = useNotificationStore();

  const {
    register,
    handleSubmit,
    reset,
    formState: {errors, isSubmitting},
  } = useForm<TFormValues>();

  useEffect(() => {
    if (user) {
      reset({firstName: user.firstName, lastName: user.lastName, email: user.email, password: ""});
    } else {
      reset({firstName: "", lastName: "", email: "", password: ""});
    }
  }, [user, reset]);

  const onSubmit = async (data: TFormValues) => {
    try {
      if (isEdit) {
        const payload: TUpdateInternalUserPayload = {
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          ...(data.password ? {password: data.password} : {}),
        };
        const res = await updateInternalUser(user.id, payload);
        if (res.error) {
          showNotification({type: "error", message: "Failed to update user"});
          return;
        }
        showNotification({type: "success", message: "User updated"});
      } else {
        const payload: TCreateInternalUserPayload = {
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          password: data.password,
        };
        const res = await createInternalUser(payload);
        if (res.error) {
          showNotification({type: "error", message: "Failed to create user"});
          return;
        }
        showNotification({type: "success", message: "User created"});
      }

      mutate("admin-internal-users");
      onClose();
    } catch {
      showNotification({type: "error", message: "Something went wrong"});
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <h2 className="text-md font-semibold text-textPrimary">
        {isEdit ? "Edit Ops User" : "Add Ops User"}
      </h2>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
        <div className="flex flex-col gap-1">
          <InputField
            label="First Name"
            placeholder="First name"
            {...register("firstName", {required: "First name is required"})}
          />
          {errors.firstName && (
            <span className="text-xs font-semibold text-danger">{errors.firstName.message}</span>
          )}
        </div>

        <div className="flex flex-col gap-1">
          <InputField
            label="Last Name"
            placeholder="Last name"
            {...register("lastName", {required: "Last name is required"})}
          />
          {errors.lastName && (
            <span className="text-xs font-semibold text-danger">{errors.lastName.message}</span>
          )}
        </div>

        <div className="flex flex-col gap-1">
          <InputField
            label="Email"
            placeholder="email@example.com"
            type="email"
            {...register("email", {required: "Email is required"})}
          />
          {errors.email && (
            <span className="text-xs font-semibold text-danger">{errors.email.message}</span>
          )}
        </div>

        <div className="flex flex-col gap-1">
          <InputField
            label={isEdit ? "New Password (leave blank to keep current)" : "Password"}
            placeholder={isEdit ? "Leave blank to keep current" : "Min 8 characters"}
            type="password"
            {...register("password", {
              ...(!isEdit && {required: "Password is required"}),
              validate: (val) =>
                !val || val.length >= 8 || "Password must be at least 8 characters",
            })}
          />
          {errors.password && (
            <span className="text-xs font-semibold text-danger">{errors.password.message}</span>
          )}
        </div>

        <Button type="submit" loading={isSubmitting}>
          {isEdit ? "Save Changes" : "Create User"}
        </Button>
      </form>
    </div>
  );
}
