import { Layout, PageLayout, Button } from "@/components";
import { useForm, FormProvider } from "react-hook-form";
import { FormInput, FormMultiSelect } from "@/components";
import { userSchema } from "@/utils/formvalidations/userSchema";
import { yupResolver } from "@hookform/resolvers/yup";
import { UserStatus, UserRole } from "@/views/";

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
            className="max-w-2xl flex flex-col gap-5"
          >
            <FormInput name="firstName" label="First Name" />
            <FormInput name="lastName" label="Last Name" />
            <FormInput name="email" label="Email" type="email" />

            <UserStatus />
            <UserRole />

            <FormMultiSelect
              name="userTeams"
              label="User Teams"
              options={[
                { label: "Engineering", value: 1 },
                { label: "HR", value: 2 },
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
