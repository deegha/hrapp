import {Layout, PageLayout, Button, Shimmer} from "@/components";
import {useForm, FormProvider} from "react-hook-form";
import {FormInput} from "@/components";
import {editUserSchema} from "@/utils/formvalidations/userSchema";
import {yupResolver} from "@hookform/resolvers/yup";
import {useNotificationStore} from "@/store/notificationStore";
import {useEffect, useState} from "react";
import {fetchUser, updateMyProfile} from "@/services";
import {TUpdateUser} from "@/types";
import {getAuthUser} from "@/utils/getAuthUser";
import useSWR from "swr";

export default function EditProfile() {
  const {showNotification} = useNotificationStore();

  const [isLoading, setIsLoading] = useState(false);

  const {data: userData} = useSWR(`fetch-auth-user`, async () => {
    const userSummary = await getAuthUser();

    if (!userSummary) return;

    return fetchUser(userSummary.employeeId.toString());
  });

  const methods = useForm<TUpdateUser>({
    resolver: yupResolver(editUserSchema),
  });

  useEffect(() => {
    if (userData) {
      methods.reset(userData?.data);
    }
  }, [methods, userData]);

  if (!userData) return <Shimmer />;

  const onSubmit = async (data: TUpdateUser) => {
    try {
      setIsLoading(true);
      const response = await updateMyProfile(data);

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
          <form onSubmit={methods.handleSubmit(onSubmit)} className="flex max-w-2xl flex-col gap-5">
            <FormInput name="firstName" label="First Name" />
            <FormInput name="lastName" label="Last Name" />
            <FormInput name="email" label="Email" type="email" disabled />

            <Button loading={isLoading} type="submit" disabled={!methods.formState.isValid}>
              Save Changes
            </Button>
          </form>
        </FormProvider>
      </PageLayout>
    </Layout>
  );
}
