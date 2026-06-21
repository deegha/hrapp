import {
  Layout,
  PageLayout,
  Button,
  FormInput,
  FormBankSelect,
  FormCurrencyInput,
  FormAccountInput,
} from "@/components";
import {useForm, FormProvider} from "react-hook-form";
import {userSchema} from "@/utils/formvalidations/userSchema";
import {yupResolver} from "@hookform/resolvers/yup";
import {UserRole, EmploymentType, UserManager} from "@/views/";
import {TCreateUser} from "@/types/";
import {createUserService, assignManager} from "@/services";
import {useNotificationStore} from "@/store/notificationStore";
import {useState} from "react";
import {IOption} from "@/types/ui";
import {useRouter} from "next/router";
import {User, Briefcase, Users, Calendar, DollarSign} from "react-feather";

const todayISO = new Date().toISOString().split("T")[0];

export default function CreateUser() {
  const router = useRouter();
  const {showNotification} = useNotificationStore();
  const methods = useForm<TCreateUser>({
    resolver: yupResolver(userSchema),
    defaultValues: {joinDate: todayISO},
  });
  const [isLoading, setIsLoading] = useState(false);
  const [manager, setManager] = useState<IOption>();

  const onSubmit = async (data: TCreateUser) => {
    try {
      setIsLoading(true);
      const response = await createUserService(data);

      if (response.error) {
        showNotification({
          message: "Something went wrong, couldn't create the user",
          type: "error",
        });
        setIsLoading(false);
        return;
      }
      if (manager) {
        await assignManager(response.data.employeeId, parseInt(manager.value || "0"));
      }

      methods.reset({joinDate: todayISO});
      setManager(undefined);
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
      <PageLayout pageName="Create User">
        <FormProvider {...methods}>
          <form onSubmit={methods.handleSubmit(onSubmit)} className="max-w-3xl space-y-6">
            {/* Page intro */}
            <div className="flex items-center gap-4 rounded-xl border border-border bg-white px-5 py-4 shadow-sm">
              <div className="bg-primary/10 flex size-11 items-center justify-center rounded-full">
                <User size={20} className="text-primary" />
              </div>
              <div>
                <p className="text-md font-semiBold text-textPrimary">New Employee</p>
                <p className="text-xs text-textSecondary">
                  Fill in the details below to create a new user account
                </p>
              </div>
            </div>

            {/* Personal Information */}
            <div className="overflow-hidden rounded-xl border border-border bg-white shadow-sm">
              <div className="flex items-center gap-2 border-b border-border bg-background px-6 py-4">
                <User size={15} className="text-primary" />
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
                <UserRole />
                <EmploymentType />
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
                </div>
              </div>
            </div>

            {/* Team */}
            <div className="rounded-xl border border-border bg-white shadow-sm">
              <div className="flex items-center gap-2 border-b border-border bg-background px-6 py-4">
                <Users size={15} className="text-primary" />
                <h2 className="text-sm font-semiBold text-textPrimary">Team</h2>
              </div>
              <div className="p-6">
                <UserManager assignManager={setManager} selectedManager={manager} />
              </div>
            </div>

            {/* Financial & Personal Details */}
            <div className="rounded-xl border border-border bg-white shadow-sm">
              <div className="flex items-center gap-2 border-b border-border bg-background px-6 py-4">
                <DollarSign size={15} className="text-primary" />
                <h2 className="text-sm font-semiBold text-textPrimary">
                  Financial &amp; Personal Details
                </h2>
              </div>
              <div className="grid grid-cols-1 gap-5 p-6 sm:grid-cols-2">
                <FormCurrencyInput name="salary" label="Salary (LKR)" />
                <FormInput name="nic" label="NIC Number" placeholder="Enter NIC number" />
                <FormInput name="epfNumber" label="EPF Number" placeholder="Enter EPF number" />
                <FormInput name="etfNumber" label="ETF Number" placeholder="Enter ETF number" />
                <div className="flex flex-col gap-1">
                  <label
                    htmlFor="dateOfBirth"
                    className="flex items-center gap-1.5 text-sm font-semibold text-textPrimary"
                  >
                    <Calendar size={13} className="text-primary" />
                    Date of Birth
                  </label>
                  <input
                    id="dateOfBirth"
                    type="date"
                    {...methods.register("dateOfBirth")}
                    className="rounded-md border border-border bg-white p-2 text-sm text-textPrimary focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <FormAccountInput name="bankAccountNumber" label="Bank Account Number" />
                <div className="sm:col-span-2">
                  <FormBankSelect name="bank" label="Bank" />
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
              <Button loading={isLoading} type="submit" disabled={!methods.formState.isValid}>
                Create User
              </Button>
            </div>
          </form>
        </FormProvider>
      </PageLayout>
    </Layout>
  );
}
