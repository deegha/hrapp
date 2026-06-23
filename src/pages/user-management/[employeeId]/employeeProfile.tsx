import {
  Layout,
  PageLayout,
  Button,
  Shimmer,
  FormInput,
  FormSelect,
  FormBankSelect,
  FormAccountInput,
  FormJobRoleSelect,
  CompensationSection,
  SalaryBreakdownPanel,
  StatusTag,
  DocumentUploader,
  LeaveAdjustModal,
} from "@/components";
import {useSalaryBreakdown} from "@/hooks/useSalaryBreakdown";
import {PendingDocumentSave} from "@/components/documentUpload/pendingDocumentSave";
import {FormProvider, useForm} from "react-hook-form";
import {yupResolver} from "@hookform/resolvers/yup";
import {editUserSchema} from "@/utils/formvalidations/userSchema";
import {useRouter} from "next/router";
import useSWR, {mutate} from "swr";
import {
  fetchUser,
  fetchMyPermissions,
  fetchEmploymentTypes,
  addUserDocument,
  deleteUserDocument,
  downloadEmployeeDocument,
  deleteUser,
} from "@/services/userService";
import {fetchJobRoles} from "@/services/organizationService";
import {fetchLeaveAdjustments, createLeaveAdjustment} from "@/services/leaveAdjustmentService";
import {TCreateLeaveAdjustmentPayload} from "@/types/leaveAdjustment";
import {TUpdateUser} from "@/types";
import {useNotificationStore} from "@/store/notificationStore";
import {useConfirmationModalStore} from "@/store/useConfirmationModalStore";
import {requestUserUpdate, updateUserByAdmin} from "@/services/userService";
import {roles, RoleKey} from "@/utils/staticValues";
import {
  User,
  Briefcase,
  Mail,
  Calendar,
  DollarSign,
  Edit2,
  Eye,
  EyeOff,
  FileText,
  Trash,
  PlusCircle,
  MinusCircle,
} from "react-feather";
import {TAllUserDetails} from "@/types/user";
import {useState} from "react";

function ReadCompensation({
  user,
  salaryRevealed,
  setSalaryRevealed,
}: {
  user: TAllUserDetails;
  salaryRevealed: boolean;
  setSalaryRevealed: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const salary = user.userInformation?.salary;
  const isFlatSalary = user.userInformation?.isFlatSalary ?? false;
  const {breakdown, isLoading} = useSalaryBreakdown(
    salaryRevealed && !isFlatSalary ? salary : undefined,
    isFlatSalary,
  );

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-white shadow-sm">
      <div className="flex items-center gap-2 border-b border-border bg-background px-6 py-4">
        <DollarSign size={15} className="text-primary" />
        <h2 className="text-sm font-semiBold text-textPrimary">Compensation</h2>
      </div>
      <div className="px-6 pb-4">
        <DetailRow
          label="Gross Salary"
          value={
            salary !== undefined ? (
              <span className="flex items-center gap-2">
                <span className="font-mono tracking-widest">
                  {salaryRevealed
                    ? `LKR ${new Intl.NumberFormat("en-US").format(salary)}`
                    : "LKR ••••••••"}
                </span>
                {isFlatSalary && (
                  <span className="bg-primary/10 rounded-full px-2 py-0.5 text-xs text-primary">
                    Flat
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => setSalaryRevealed((v) => !v)}
                  className="text-textSecondary transition hover:text-textPrimary"
                >
                  {salaryRevealed ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </span>
            ) : null
          }
        />
        {salaryRevealed && !isFlatSalary && (
          <SalaryBreakdownPanel breakdown={breakdown} isLoading={isLoading} />
        )}
      </div>
    </div>
  );
}

const DetailRow = ({label, value}: {label: string; value: React.ReactNode}) => (
  <div className="flex items-start gap-5 border-t border-border py-3">
    <div className="w-52 shrink-0 text-sm font-semibold text-textSecondary">{label}</div>
    <div className="text-sm text-textPrimary">
      {value ?? <span className="text-textSecondary">—</span>}
    </div>
  </div>
);

export default function UserDetails() {
  const router = useRouter();
  const {employeeId} = router.query as {employeeId?: string};
  const {showNotification} = useNotificationStore();
  const {openModal} = useConfirmationModalStore();

  const [isEditing, setIsEditing] = useState(false);
  const [salaryRevealed, setSalaryRevealed] = useState(false);
  const [uploadingDocument, setUploadingDocument] = useState(false);
  const [documentTitle, setDocumentTitle] = useState("");
  const [pendingDocumentUrl, setPendingDocumentUrl] = useState("");
  const [uploaderKey, setUploaderKey] = useState(0);
  // null = closed, 0 = open (no pre-selection), >0 = open with specific leave type pre-selected
  const [adjustModalLeaveTypeId, setAdjustModalLeaveTypeId] = useState<number | null>(null);

  const methods = useForm<TUpdateUser>({resolver: yupResolver(editUserSchema)});

  const {data: userData} = useSWR(employeeId ? `fetch-user-${employeeId}` : null, async () =>
    employeeId ? fetchUser(employeeId) : undefined,
  );
  const {data: permissionData} = useSWR("my-permissions", fetchMyPermissions);
  const {data: employmentTypesData} = useSWR("fetch-employment-types", fetchEmploymentTypes);
  const {data: jobRolesData} = useSWR("job-roles", fetchJobRoles);

  const perm = permissionData?.data?.permission;
  const isAdmin = perm === "ADMIN_USER" || perm === "SUPER_USER";
  const isAdminOrL2 = ["ADMIN_USER", "SUPER_USER", "ADMIN_USER_L2"].includes(perm ?? "");

  const empId = employeeId ? parseInt(employeeId, 10) : null;

  const {data: leaveAdjData, mutate: mutateAdjustments} = useSWR(
    empId && isAdminOrL2 ? `leave-adjustments-${empId}` : null,
    () => fetchLeaveAdjustments(empId!),
  );

  const jobRoles = jobRolesData?.data ?? [];

  const user = userData?.data;

  const resetFormFromUser = () => {
    const info = user?.userInformation;
    methods.reset({
      firstName: user?.firstName,
      lastName: user?.lastName,
      email: user?.email,
      userLevel: user?.userLevel,
      employmentTypeId: user?.EmploymentType?.id,
      joinDate: user?.joinDate ? user.joinDate.split("T")[0] : undefined,
      jobRoleId: user?.jobRoleId ?? undefined,
      salary: info?.salary ?? undefined,
      isFlatSalary: info?.isFlatSalary ?? false,
      nic: info?.nic ?? undefined,
      epfNumber: info?.epfNumber ?? undefined,
      etfNumber: info?.etfNumber ?? undefined,
      dateOfBirth: info?.dateOfBirth
        ? new Date(info.dateOfBirth).toISOString().split("T")[0]
        : undefined,
      bankAccountNumber: info?.bankAccountNumber ?? undefined,
      bank: info?.bank ?? undefined,
    });
  };

  const handleEdit = () => {
    resetFormFromUser();
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  const onSubmit = async (payload: TUpdateUser) => {
    if (!employeeId) return;
    try {
      if (isAdmin) {
        const resp = await updateUserByAdmin(parseInt(employeeId, 10), payload);
        if (resp.error) {
          showNotification({type: "error", message: "Failed to update user"});
          return;
        }
        await mutate(`fetch-user-${employeeId}`);
        showNotification({type: "success", message: "User updated successfully"});
        setIsEditing(false);
      } else {
        const resp = await requestUserUpdate(parseInt(employeeId, 10), payload);
        if (resp.error) {
          showNotification({type: "error", message: "Failed to request update"});
          return;
        }
        await mutate(`fetch-user-${employeeId}`);
        showNotification({type: "success", message: "Update request sent for approval"});
        setIsEditing(false);
      }
    } catch {
      showNotification({type: "error", message: "Something went wrong"});
    }
  };

  const handleDocumentUpload = (url: string) => {
    const filename = url.split("/").pop() || "";
    setDocumentTitle(filename.split(".").slice(0, -1).join("."));
    setPendingDocumentUrl(url);
  };

  const saveDocument = async () => {
    if (!documentTitle.trim() || !pendingDocumentUrl || !employeeId) return;
    try {
      setUploadingDocument(true);
      const resp = await addUserDocument(
        parseInt(employeeId, 10),
        documentTitle.trim(),
        pendingDocumentUrl,
      );
      if (resp.error) {
        showNotification({type: "error", message: "Failed to save document"});
        return;
      }
      await mutate(`fetch-user-${employeeId}`);
      showNotification({type: "success", message: "Document uploaded successfully"});
      setDocumentTitle("");
      setPendingDocumentUrl("");
      setUploaderKey((k) => k + 1);
    } catch {
      showNotification({type: "error", message: "Failed to save document"});
    } finally {
      setUploadingDocument(false);
    }
  };

  const handleDeleteDocument = (documentId: number, title: string) => {
    openModal({
      title: "Delete document?",
      description: `Are you sure you want to delete "${title}"?`,
      onConfirm: async () => {
        try {
          const resp = await deleteUserDocument(parseInt(employeeId!, 10), documentId);
          if (resp.error) {
            showNotification({type: "error", message: "Failed to delete document"});
            return;
          }
          await mutate(`fetch-user-${employeeId}`);
          showNotification({type: "success", message: "Document deleted successfully"});
        } catch {
          showNotification({type: "error", message: "Failed to delete document"});
        }
      },
    });
  };

  const handleLeaveAdjust = async (payload: TCreateLeaveAdjustmentPayload) => {
    if (!empId) return;
    const resp = await createLeaveAdjustment(empId, payload);
    if (resp.error) throw new Error("Failed to save adjustment");
    await mutateAdjustments();
    showNotification({
      type: "success",
      message: `Leave ${payload.type === "CREDIT" ? "credited" : "debited"} successfully`,
    });
  };

  const breadcrumbFilter = (segments: string[]) =>
    segments.filter(
      (seg, idx, arr) =>
        !(arr[idx - 1] === "user-management" && arr[idx + 1] === "employeeProfile"),
    );

  const handleDeleteUser = () => {
    if (!employeeId) return;
    openModal({
      title: "Delete employee?",
      description: `Are you sure you want to permanently delete ${user?.firstName} ${user?.lastName}? This action cannot be undone.`,
      onConfirm: async () => {
        try {
          const resp = await deleteUser(parseInt(employeeId, 10));
          if (resp.error) {
            showNotification({type: "error", message: "Failed to delete employee"});
            return;
          }
          showNotification({type: "success", message: "Employee deleted successfully"});
          router.push("/user-management");
        } catch {
          showNotification({type: "error", message: "Failed to delete employee"});
        }
      },
    });
  };

  if (!user) {
    return (
      <Layout>
        <PageLayout pageName="Employee Profile">
          <Shimmer />
        </PageLayout>
      </Layout>
    );
  }

  const userLevelLabel = roles[user.userLevel as RoleKey] || user.userLevel;
  return (
    <Layout>
      <PageLayout pageName="Employee Profile" breadcrumbFilter={breadcrumbFilter}>
        <div className="max-w-3xl space-y-6">
          {/* Header */}
          <div className="flex items-center gap-4 rounded-xl border border-border bg-white px-5 py-4 shadow-sm">
            <div className="bg-primary/10 flex size-11 shrink-0 items-center justify-center rounded-full">
              <User size={20} className="text-primary" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-md font-semiBold text-textPrimary">
                {user.firstName} {user.lastName}
              </p>
              <p className="text-xs text-textSecondary">EMP-{user.employeeId}</p>
            </div>
            {user.UserStatus?.statusLabel && <StatusTag status={user.UserStatus.statusLabel} />}
            {!isAdmin && (
              <span className="bg-secondary/10 rounded-full px-3 py-1 text-xs font-semibold text-secondary">
                Changes require approval
              </span>
            )}
            <div className="ml-auto shrink-0">
              {isEditing ? null : (
                <Button onClick={handleEdit}>
                  <span className="flex items-center gap-2">
                    <Edit2 size={14} />
                    Edit User
                  </span>
                </Button>
              )}
            </div>
          </div>

          {isEditing ? (
            /* ── EDIT MODE ── */
            <FormProvider {...methods}>
              <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-6">
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
                <div className="rounded-xl border border-border bg-white shadow-sm">
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
                    </div>
                    {isAdminOrL2 && jobRoles.length > 0 && (
                      <FormJobRoleSelect name="jobRoleId" jobRoles={jobRoles} />
                    )}
                  </div>
                </div>

                {/* Compensation (admin only) */}
                {isAdmin && <CompensationSection />}

                {/* Personal Details (admin only) */}
                {isAdmin && (
                  <div className="rounded-xl border border-border bg-white shadow-sm">
                    <div className="flex items-center gap-2 border-b border-border bg-background px-6 py-4">
                      <Calendar size={15} className="text-primary" />
                      <h2 className="text-sm font-semiBold text-textPrimary">Personal Details</h2>
                    </div>
                    <div className="grid grid-cols-1 gap-5 p-6 sm:grid-cols-2">
                      <FormInput name="nic" label="NIC Number" placeholder="Enter NIC number" />
                      <FormInput
                        name="epfNumber"
                        label="EPF Number"
                        placeholder="Enter EPF number"
                      />
                      <FormInput
                        name="etfNumber"
                        label="ETF Number"
                        placeholder="Enter ETF number"
                      />
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
                )}

                {/* Actions */}
                <div className="flex items-center justify-end gap-3 pb-4">
                  <button
                    type="button"
                    onClick={handleCancel}
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
          ) : (
            /* ── READ MODE ── */
            <>
              {/* Personal Information */}
              <div className="overflow-hidden rounded-xl border border-border bg-white shadow-sm">
                <div className="flex items-center gap-2 border-b border-border bg-background px-6 py-4">
                  <Mail size={15} className="text-primary" />
                  <h2 className="text-sm font-semiBold text-textPrimary">Personal Information</h2>
                </div>
                <div className="px-6 pb-3">
                  <DetailRow label="Full Name" value={`${user.firstName} ${user.lastName}`} />
                  <DetailRow label="Email Address" value={user.email} />
                  <DetailRow label="Department" value={user.Department?.departmentName} />
                  <DetailRow
                    label="Managed By"
                    value={
                      user.manager ? `${user.manager.firstName} ${user.manager.lastName}` : null
                    }
                  />
                </div>
              </div>

              {/* Employment Details */}
              <div className="overflow-hidden rounded-xl border border-border bg-white shadow-sm">
                <div className="flex items-center gap-2 border-b border-border bg-background px-6 py-4">
                  <Briefcase size={15} className="text-primary" />
                  <h2 className="text-sm font-semiBold text-textPrimary">Employment Details</h2>
                </div>
                <div className="px-6 pb-3">
                  <DetailRow label="User Level" value={userLevelLabel} />
                  <DetailRow label="Employment Type" value={user.EmploymentType?.typeLabel} />
                  <DetailRow
                    label="Join Date"
                    value={
                      user.joinDate ? (
                        <span className="flex items-baseline gap-2">
                          <span>
                            {new Date(user.joinDate).toLocaleDateString("en-GB", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            })}
                          </span>
                          <span className="text-xs text-textSecondary">DD MMM YYYY</span>
                        </span>
                      ) : null
                    }
                  />
                  {user.JobRole && <DetailRow label="Job Title" value={user.JobRole.title} />}
                </div>
              </div>

              {/* Compensation read-mode (admin only) */}
              {isAdmin && (
                <ReadCompensation
                  user={user}
                  salaryRevealed={salaryRevealed}
                  setSalaryRevealed={setSalaryRevealed}
                />
              )}

              {/* Personal Details read-mode (admin only) */}
              {isAdmin && (
                <div className="overflow-hidden rounded-xl border border-border bg-white shadow-sm">
                  <div className="flex items-center gap-2 border-b border-border bg-background px-6 py-4">
                    <Calendar size={15} className="text-primary" />
                    <h2 className="text-sm font-semiBold text-textPrimary">Personal Details</h2>
                  </div>
                  <div className="px-6 pb-3">
                    <DetailRow label="NIC Number" value={user.userInformation?.nic} />
                    <DetailRow label="EPF Number" value={user.userInformation?.epfNumber} />
                    <DetailRow label="ETF Number" value={user.userInformation?.etfNumber} />
                    <DetailRow
                      label="Date of Birth"
                      value={
                        user.userInformation?.dateOfBirth
                          ? new Date(user.userInformation.dateOfBirth).toLocaleDateString()
                          : null
                      }
                    />
                    <DetailRow label="Bank" value={user.userInformation?.bank} />
                    <DetailRow
                      label="Bank Account Number"
                      value={
                        user.userInformation?.bankAccountNumber
                          ? (user.userInformation.bankAccountNumber.match(/.{1,4}/g)?.join(" ") ??
                            user.userInformation.bankAccountNumber)
                          : null
                      }
                    />
                  </div>
                </div>
              )}

              {/* Documents */}
              <div className="overflow-hidden rounded-xl border border-border bg-white shadow-sm">
                <div className="flex items-center gap-2 border-b border-border bg-background px-6 py-4">
                  <FileText size={15} className="text-primary" />
                  <h2 className="text-sm font-semiBold text-textPrimary">Documents</h2>
                </div>
                <div className="flex flex-col gap-4 p-6">
                  {user.documents && user.documents.length > 0 ? (
                    <div>
                      {user.documents.map((doc) => (
                        <div
                          key={doc.id}
                          className="flex items-center justify-between border-t border-border py-3"
                        >
                          <div className="min-w-0">
                            <div className="truncate text-sm font-semibold">{doc.title}</div>
                            <button
                              onClick={async () => {
                                const ext = (() => {
                                  try {
                                    const p = new URL(doc.fileUrl).pathname;
                                    return (p.split(".").pop() || "").toLowerCase();
                                  } catch {
                                    return (doc.fileUrl.split(".").pop() || "").toLowerCase();
                                  }
                                })();
                                const name = `${doc.title}${ext ? `.${ext}` : ""}`;
                                try {
                                  await downloadEmployeeDocument(
                                    parseInt(employeeId!, 10),
                                    doc.id,
                                    name,
                                  );
                                } catch {
                                  showNotification({
                                    type: "error",
                                    message: "Failed to download document",
                                  });
                                }
                              }}
                              className="text-left text-xs text-blue-500 underline"
                            >
                              Download
                            </button>
                          </div>
                          <button
                            onClick={() => handleDeleteDocument(doc.id, doc.title)}
                            className="text-red-500 transition hover:text-red-700"
                          >
                            <Trash size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-textSecondary">No documents uploaded yet.</p>
                  )}

                  <div className="flex flex-col gap-3">
                    <h3 className="text-sm font-medium">Upload Document</h3>
                    <DocumentUploader key={uploaderKey} onUploadComplete={handleDocumentUpload} />
                    {pendingDocumentUrl && (
                      <PendingDocumentSave
                        title={documentTitle}
                        onTitleChange={setDocumentTitle}
                        loading={uploadingDocument}
                        onSave={saveDocument}
                        onCancel={() => {
                          setDocumentTitle("");
                          setPendingDocumentUrl("");
                          setUploaderKey((k) => k + 1);
                        }}
                      />
                    )}
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Leave Balance — always visible to admin & L2 admin */}
          {isAdminOrL2 && leaveAdjData?.data && (
            <div className="overflow-hidden rounded-xl border border-border bg-white shadow-sm">
              <div className="flex items-center justify-between border-b border-border bg-background px-6 py-4">
                <div className="flex items-center gap-2">
                  <Calendar size={15} className="text-primary" />
                  <h2 className="text-sm font-semiBold text-textPrimary">Leave Balance</h2>
                </div>
                <button
                  onClick={() =>
                    setAdjustModalLeaveTypeId(leaveAdjData.data.balances[0]?.leaveTypeId ?? 0)
                  }
                  className="flex items-center gap-1.5 rounded-lg border border-border bg-white px-3 py-1.5 text-xs font-medium text-textPrimary shadow-sm transition hover:shadow-md"
                >
                  <PlusCircle size={13} />
                  Adjust
                </button>
              </div>

              {/* Balance rows */}
              <div className="divide-y divide-border">
                {leaveAdjData.data.balances.map((b) => (
                  <div key={b.leaveTypeId} className="flex items-center justify-between px-6 py-3">
                    <div>
                      <p className="text-sm font-medium text-textPrimary">{b.label}</p>
                      <p className="mt-0.5 text-xs text-textSecondary">
                        {b.credited} credited · {b.taken} taken
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span
                        className={`text-sm font-semibold ${b.balance < 0 ? "text-red-500" : "text-green-600"}`}
                      >
                        {b.balance > 0 ? "+" : ""}
                        {b.balance} day{b.balance !== 1 ? "s" : ""}
                      </span>
                      <button
                        onClick={() => setAdjustModalLeaveTypeId(b.leaveTypeId)}
                        className="flex items-center gap-1 rounded-lg border border-border px-2.5 py-1 text-xs text-textSecondary transition hover:border-primary hover:text-primary"
                      >
                        <PlusCircle size={11} />
                        Adjust
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Adjustment history */}
              {leaveAdjData.data.adjustments.length > 0 && (
                <div className="border-t border-border">
                  <p className="px-6 pt-4 text-xs font-semibold uppercase tracking-wider text-textSecondary">
                    Adjustment History
                  </p>
                  <div className="divide-y divide-border">
                    {leaveAdjData.data.adjustments.map((adj) => (
                      <div key={adj.id} className="flex items-start gap-3 px-6 py-3">
                        <div
                          className={`mt-0.5 shrink-0 rounded-full p-1 ${adj.amount > 0 ? "bg-green-100 text-green-600" : "bg-red-100 text-red-500"}`}
                        >
                          {adj.amount > 0 ? <PlusCircle size={12} /> : <MinusCircle size={12} />}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm text-textPrimary">
                            <span className="font-semibold">
                              {adj.amount > 0 ? "+" : ""}
                              {adj.amount} day{Math.abs(adj.amount) !== 1 ? "s" : ""}
                            </span>{" "}
                            · {adj.leaveType.leaveTypeLabel}
                          </p>
                          <p className="mt-0.5 text-xs text-textSecondary">{adj.reason}</p>
                          <p className="mt-0.5 text-xs text-textSecondary">
                            By {adj.createdBy.firstName} {adj.createdBy.lastName} ·{" "}
                            {new Date(adj.createdAt).toLocaleDateString("en-US", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {leaveAdjData.data.adjustments.length === 0 &&
                leaveAdjData.data.balances.every((b) => b.credited === 0) && (
                  <p className="px-6 py-4 text-sm text-textSecondary">
                    No leave adjustments yet. Use Adjust to credit or debit days.
                  </p>
                )}
            </div>
          )}
        </div>

        {/* Delete employee — admin only, at the very bottom */}
        {isAdmin && user.UserStatus?.statusLabel !== "DELETED" && (
          <div className="max-w-3xl pt-6">
            <div className="rounded-xl border border-red-200 bg-red-50 p-5">
              <h3 className="mb-1 text-sm font-semibold text-red-700">Danger Zone</h3>
              <p className="mb-4 text-sm text-red-600">
                Permanently delete this employee and all associated data. This cannot be undone.
              </p>
              <Button variant="danger" onClick={handleDeleteUser}>
                <div className="flex items-center gap-2">
                  <Trash size={14} />
                  Delete Employee
                </div>
              </Button>
            </div>
          </div>
        )}
      </PageLayout>

      {adjustModalLeaveTypeId !== null && leaveAdjData?.data && (
        <LeaveAdjustModal
          balances={leaveAdjData.data.balances}
          prefillLeaveTypeId={adjustModalLeaveTypeId > 0 ? adjustModalLeaveTypeId : undefined}
          onClose={() => setAdjustModalLeaveTypeId(null)}
          onSubmit={handleLeaveAdjust}
        />
      )}
    </Layout>
  );
}
