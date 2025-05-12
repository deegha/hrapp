import { Layout, PageLayout, Button } from "@/components";
import { useForm, FormProvider } from "react-hook-form";
import { FormInput } from "@/components";
import { userSchema } from "@/utils/formvalidations/userSchema";
import { yupResolver } from "@hookform/resolvers/yup";
import { UserRole } from "@/views/";
import { TCreateUser } from "@/types/";
import { createUserService } from "@/services";
import { useNotificationStore } from "@/store/notificationStore";
import { useState } from "react";

export default function CreateUser() {
  const { showNotification } = useNotificationStore();
  const methods = useForm<TCreateUser>({ resolver: yupResolver(userSchema) });
  const [isLoading, setIsLoading] = useState(false);

  const onSubmit = async (data: TCreateUser) => {
    try {
      setIsLoading(true);
      const response = await createUserService({
        ...data,
        userStatusId: 7,
      });

      if (response.error) {
        showNotification({
          message: "Something went wrong, couldn't create the user",
          type: "error",
        });
        setIsLoading(false);
        return;
      }

      methods.reset();
      showNotification({
        message: "Successfully created the user",
        type: "success",
      });

      setIsLoading(false);
    } catch (e) {
      console.log(e);
      setIsLoading(false);
      showNotification({
        message: "Something went wrong, couldn't create the user",
        type: "error",
      });
    }
  };

  return (
    <Layout>
      <PageLayout pageName="User Management - Create User">
        <FormProvider {...methods}>
          <form
            onSubmit={methods.handleSubmit(onSubmit)}
            className="max-w-2xl flex flex-col gap-5"
          >
            <FormInput name="firstName" label="First Name" />
            <FormInput name="lastName" label="Last Name" />
            <FormInput name="email" label="Email" type="email" />

            {/* <UserStatus /> */}
            <UserRole />

            <Button
              loading={isLoading}
              type="submit"
              disabled={!methods.formState.isValid}
            >
              Create User
            </Button>
          </form>
        </FormProvider>
      </PageLayout>
    </Layout>
  );
}
