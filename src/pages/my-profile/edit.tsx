import { Layout, PageLayout, Button } from "@/components";
import { useForm, FormProvider } from "react-hook-form";
import { FormInput } from "@/components";
import { userSchema } from "@/utils/formvalidations/userSchema";
import { yupResolver } from "@hookform/resolvers/yup";
import { useNotificationStore } from "@/store/notificationStore";
import { useState } from "react";
import { updateUser } from "@/services";
import { TUpdateUser } from "@/types";
import { getAuthUser } from "@/utils/getAuthUser";

export default function EditProfile() {
  const { showNotification } = useNotificationStore();
  const methods = useForm<TUpdateUser>({ resolver: yupResolver(userSchema) });
  const [isLoading, setIsLoading] = useState(false);

  const onSubmit = async (data: TUpdateUser) => {
    try {
      const userSummary = await getAuthUser();
      setIsLoading(true);
      const response = await updateUser(userSummary.employeeId, data);

      if (response.error) {
        showNotification({
          message: "Something went wrong, couldn't update the profile",
          type: "error",
        });
        setIsLoading(false);
        return;
      }

      methods.reset();
      showNotification({
        message: "Successfully updated the profile",
        type: "success",
      });

      setIsLoading(false);
    } catch (e) {
      console.log(e);
      setIsLoading(false);
      showNotification({
        message: "Something went wrong, couldn't update the profile",
        type: "error",
      });
    }
  };

  return (
    <Layout>
      <PageLayout pageName="Edit Profile">
        <FormProvider {...methods}>
          <form
            onSubmit={methods.handleSubmit(onSubmit)}
            className="max-w-2xl flex flex-col gap-5"
          >
            <FormInput name="firstName" label="First Name" />
            <FormInput name="lastName" label="Last Name" />
            <FormInput name="email" label="Email" type="email" />

            <Button
              loading={isLoading}
              type="submit"
              disabled={!methods.formState.isValid}
            >
              Save Changes
            </Button>
          </form>
        </FormProvider>
      </PageLayout>
    </Layout>
  );
}
