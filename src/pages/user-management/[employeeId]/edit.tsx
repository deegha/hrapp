import {Layout, PageLayout, Button, Shimmer, FormInput} from "@/components";
import {FormProvider, useForm} from "react-hook-form";
import {yupResolver} from "@hookform/resolvers/yup";
import {editUserSchema} from "@/utils/formvalidations/userSchema";
import {useRouter} from "next/router";
import useSWR from "swr";
import {fetchUser, fetchMyPermissions} from "@/services/userService";
import {TUpdateUser} from "@/types";
import {useNotificationStore} from "@/store/notificationStore";
import {requestUserUpdate, updateUserByAdmin} from "@/services/userService";

export default function EditUser() {
  const router = useRouter();
  const {employeeId} = router.query as {employeeId?: string};
  const {showNotification} = useNotificationStore();

  const methods = useForm<TUpdateUser>({resolver: yupResolver(editUserSchema)});

  const {data: userData} = useSWR(employeeId ? `fetch-user-${employeeId}` : null, async () =>
    employeeId ? fetchUser(employeeId) : undefined,
  );

  const {data: permissionData} = useSWR("my-permissions", fetchMyPermissions);

  if (!userData)
    return (
      <Layout>
        <PageLayout pageName="Edit User">
          <Shimmer />
        </PageLayout>
      </Layout>
    );

  if (!methods.getValues("firstName") && userData?.data) {
    methods.reset({
      firstName: userData.data.firstName,
      lastName: userData.data.lastName,
      email: userData.data.email,
    });
  }

  const breadcrumbFilter = (segments: string[]) =>
    segments.filter(
      (seg, idx, arr) => !(arr[idx - 1] === "user-management" && arr[idx + 1] === "edit"),
    );

  const onSubmit = async (payload: TUpdateUser) => {
    if (!employeeId) return;
    const perm = permissionData?.data?.permission;
    const isAdmin = perm === "ADMIN_USER" || perm === "SUPER_USER";

    try {
      if (isAdmin) {
        const resp = await updateUserByAdmin(parseInt(employeeId, 10), payload);
        if (resp.error) {
          showNotification({type: "error", message: "Failed to update user"});
          return;
        }
        showNotification({type: "success", message: "User updated successfully"});
      } else {
        const resp = await requestUserUpdate(parseInt(employeeId, 10), payload);
        if (resp.error) {
          showNotification({type: "error", message: "Failed to request update"});
          return;
        }
        showNotification({type: "success", message: "Update request sent for approval"});
      }
    } catch {
      showNotification({type: "error", message: "Something went wrong"});
    }
  };

  return (
    <Layout>
      <PageLayout pageName={`Edit User (EMP-${employeeId})`} breadcrumbFilter={breadcrumbFilter}>
        <FormProvider {...methods}>
          <form onSubmit={methods.handleSubmit(onSubmit)} className="flex max-w-2xl flex-col gap-5">
            <FormInput name="firstName" label="First Name" />
            <FormInput name="lastName" label="Last Name" />
            <FormInput name="email" label="Email" type="email" />
            <Button type="submit" disabled={!methods.formState.isValid}>
              Save Changes
            </Button>
          </form>
        </FormProvider>
      </PageLayout>
    </Layout>
  );
}
