import { Layout, PageLayout, Button } from "@/components";
import { useForm, FormProvider } from "react-hook-form";
import { FormInput, FormSelect, FormMultiSelect } from "@/components";
import { userSchema } from "@/utils/formvalidations/userSchema";
import { yupResolver } from "@hookform/resolvers/yup";

export default function CreateUser() {
  const methods = useForm({ resolver: yupResolver(userSchema) });

  const onSubmit = (data: any) => {
    console.log("User Submitted:", data);
    // send to API
  };

  return (
    <Layout>
      <PageLayout pageName="User Management - Create User">
        <FormProvider {...methods}>
          <form
            onSubmit={methods.handleSubmit(onSubmit)}
            className="max-w-2xl bg-white p-6 rounded-2xl shadow-sm flex flex-col gap-4"
          >
            <FormInput name="firstName" label="First Name" />
            <FormInput name="lastName" label="Last Name" />
            <FormInput name="email" label="Email" type="email" />
            <FormInput name="password" label="Password" type="password" />

            <FormSelect
              name="organizationId"
              label="Organization"
              options={[
                { label: "Acme Inc.", value: 1 },
                { label: "Globex", value: 2 },
              ]}
            />

            <FormSelect
              name="statusId"
              label="Status"
              options={[
                { label: "Active", value: 1 },
                { label: "Inactive", value: 2 },
              ]}
            />

            <FormSelect
              name="userStatusId"
              label="User Status"
              options={[
                { label: "Probation", value: 1 },
                { label: "Permanent", value: 2 },
              ]}
            />

            <FormMultiSelect
              name="userTeams"
              label="User Teams"
              options={[
                { label: "Engineering", value: 1 },
                { label: "HR", value: 2 },
              ]}
            />

            <FormMultiSelect
              name="userPermissions"
              label="Permissions"
              options={[
                { label: "Admin", value: 1 },
                { label: "Editor", value: 2 },
              ]}
            />

            <FormInput name="salary" label="Salary" type="number" />

            <Button type="submit">Create User</Button>
          </form>
        </FormProvider>
      </PageLayout>
    </Layout>
  );
}
