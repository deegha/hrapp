import {Layout, PageLayout, Button, Shimmer, FormInput, FormSelect} from "@/components";
import {FormProvider, useForm} from "react-hook-form";
import {yupResolver} from "@hookform/resolvers/yup";
import {editUserSchema} from "@/utils/formvalidations/userSchema";
import {useRouter} from "next/router";
import useSWR, {mutate} from "swr";
import {fetchUser, fetchMyPermissions, fetchEmploymentTypes} from "@/services/userService";
import {TUpdateUser} from "@/types";
import {useNotificationStore} from "@/store/notificationStore";
import {requestUserUpdate, updateUserByAdmin} from "@/services/userService";
import {roles, RoleKey} from "@/utils/staticValues";
import {User, Briefcase, Mail, Calendar} from "react-feather";

export default function EditUser() {
  const router = useRouter();
  const {employeeId} = router.query as {employeeId?: string};
  const {showNotification} = useNotificationStore();

  const methods = useForm<TUpdateUser>({resolver: yupResolver(editUserSchema)});

  const {data: userData} = useSWR(employeeId ? `fetch-user-${employeeId}` : null, async () =>
    employeeId ? fetchUser(employeeId) : undefined,
  );

  const {data: permissionData} = useSWR("my-permissions", fetchMyPermissions);
  const {data: employmentTypesData} = useSWR("fetch-employment-types", fetchEmploymentTypes);

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
      userLevel: userData.data.userLevel,
      employmentTypeId: userData.data.EmploymentType?.id,
      joinDate: userData.data.joinDate ? userData.data.joinDate.split("T")[0] : undefined,
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
        await mutate(`fetch-user-${employeeId}`);
        showNotification({type: "success", message: "User updated successfully"});
      } else {
        const resp = await requestUserUpdate(parseInt(employeeId, 10), payload);
        if (resp.error) {
          showNotification({type: "error", message: "Failed to request update"});
          return;
        }
        await mutate(`fetch-user-${employeeId}`);
        showNotification({type: "success", message: "Update request sent for approval"});
      }
    } catch {
      showNotification({type: "error", message: "Something went wrong"});
    }
  };

  const perm = permissionData?.data?.permission;
  const isAdmin = perm === "ADMIN_USER" || perm === "SUPER_USER";

  return (
    <Layout>
      <PageLayout pageName="Edit User" breadcrumbFilter={breadcrumbFilter}>
        <FormProvider {...methods}>
          <form onSubmit={methods.handleSubmit(onSubmit)} className="max-w-3xl space-y-6">
            {/* Employee ID header */}
            <div className="flex items-center gap-4 rounded-xl border border-border bg-white px-5 py-4 shadow-sm">
              <div className="bg-primary/10 flex size-11 items-center justify-center rounded-full">
                <User size={20} className="text-primary" />
              </div>
              <div>
                <p className="text-xs text-textSecondary">Employee ID</p>
                <p className="text-md font-semiBold text-textPrimary">EMP-{employeeId}</p>
              </div>
              {!isAdmin && (
                <span className="bg-secondary/10 ml-auto rounded-full px-3 py-1 text-xs font-semibold text-secondary">
                  Changes require approval
                </span>
              )}
            </div>

            {/* Personal Information */}
            <div className="overflow-hidden rounded-xl border border-border bg-white shadow-sm">
              <div className="flex items-center gap-2 border-b border-border bg-background px-6 py-4">
                <Mail size={15} className="text-primary" />
                <h2 className="text-sm font-semiBold text-textPrimary">Personal Information</h2>
              </div>
              <div className="grid grid-cols-1 gap-5 p-6 sm:grid-cols-2">
                <FormInput name="firstName" label="First Name" placeholder="Enter first name" />
                <FormInput name="lastName" label="Last Name" placeholder="Enter last name" />
                <div className="sm:col-span-2">
                  <FormInput
                    name="email"
                    label="Email Address"
                    type="email"
                    placeholder="Enter email address"
                  />
                </div>
              </div>
            </div>

            {/* Employment Details */}
            <div className="overflow-hidden rounded-xl border border-border bg-white shadow-sm">
              <div className="flex items-center gap-2 border-b border-border bg-background px-6 py-4">
                <Briefcase size={15} className="text-primary" />
                <h2 className="text-sm font-semiBold text-textPrimary">Employment Details</h2>
              </div>
              <div className="grid grid-cols-1 gap-5 p-6 sm:grid-cols-2">
                <FormSelect
                  name="userLevel"
                  label="User Level"
                  options={Object.keys(roles).map((k) => ({
                    label: roles[k as RoleKey],
                    value: k,
                  }))}
                />
                <FormSelect
                  name="employmentTypeId"
                  label="Employment Type"
                  options={(employmentTypesData?.data || []).map(
                    (t: {id: number; typeLabel: string}) => ({
                      label: t.typeLabel,
                      value: t.id,
                    }),
                  )}
                />
                <div className="flex flex-col gap-1">
                  <label
                    htmlFor="joinDate"
                    className="flex items-center gap-1.5 text-sm font-semibold text-textPrimary"
                  >
                    <Calendar size={13} className="text-primary" />
                    Join Date
                  </label>
                  <input
                    id="joinDate"
                    type="date"
                    {...methods.register("joinDate")}
                    className="rounded-md border border-border bg-white p-2 text-sm text-textPrimary focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  {methods.formState.errors.joinDate && (
                    <span className="text-xs font-semibold text-danger">
                      {`${methods.formState.errors.joinDate.message}`}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pb-4">
              <button
                type="button"
                onClick={() => router.back()}
                className="rounded-md border border-border px-5 py-2 text-sm font-semibold text-textPrimary transition hover:bg-background"
              >
                Cancel
              </button>
              <Button type="submit" disabled={!methods.formState.isValid}>
                {isAdmin ? "Save Changes" : "Request Update"}
              </Button>
            </div>
          </form>
        </FormProvider>
      </PageLayout>
    </Layout>
  );
}
