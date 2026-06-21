import {
  Layout,
  PageLayout,
  Button,
  Shimmer,
  FormInput,
  FormSelect,
  FormBankSelect,
  FormCurrencyInput,
  FormAccountInput,
  StatusTag,
  DocumentUploader,
} from "@/components";
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
} from "@/services/userService";
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
} from "react-feather";
import {useState} from "react";

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

  const methods = useForm<TUpdateUser>({resolver: yupResolver(editUserSchema)});

  const {data: userData} = useSWR(employeeId ? `fetch-user-${employeeId}` : null, async () =>
    employeeId ? fetchUser(employeeId) : undefined,
  );
  const {data: permissionData} = useSWR("my-permissions", fetchMyPermissions);
  const {data: employmentTypesData} = useSWR("fetch-employment-types", fetchEmploymentTypes);

  const perm = permissionData?.data?.permission;
  const isAdmin = perm === "ADMIN_USER" || perm === "SUPER_USER";

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
      salary: info?.salary ?? undefined,
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

  const breadcrumbFilter = (segments: string[]) =>
    segments.filter(
      (seg, idx, arr) => !(arr[idx - 1] === "user-management" && arr[idx + 1] === "edit"),
    );

  if (!user) {
    return (
      <Layout>
        <PageLayout pageName="User Details">
          <Shimmer />
        </PageLayout>
      </Layout>
    );
  }

  const userLevelLabel = roles[user.userLevel as RoleKey] || user.userLevel;

  return (
    <Layout>
      <PageLayout pageName="User Details" breadcrumbFilter={breadcrumbFilter}>
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
                  </div>
                </div>

                {/* Financial & Personal Details (admin only) */}
                {isAdmin && (
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
                    value={user.joinDate ? new Date(user.joinDate).toLocaleDateString() : null}
                  />
                </div>
              </div>

              {/* Financial & Personal Details (admin only) */}
              {isAdmin && (
                <div className="overflow-hidden rounded-xl border border-border bg-white shadow-sm">
                  <div className="flex items-center gap-2 border-b border-border bg-background px-6 py-4">
                    <DollarSign size={15} className="text-primary" />
                    <h2 className="text-sm font-semiBold text-textPrimary">
                      Financial &amp; Personal Details
                    </h2>
                  </div>
                  <div className="px-6 pb-3">
                    <DetailRow
                      label="Salary (LKR)"
                      value={
                        user.userInformation?.salary !== undefined ? (
                          <span className="flex items-center gap-2">
                            <span className="font-mono tracking-widest">
                              {salaryRevealed
                                ? `LKR ${new Intl.NumberFormat("en-US").format(user.userInformation.salary)}`
                                : "LKR ••••••••"}
                            </span>
                            <button
                              type="button"
                              onClick={() => setSalaryRevealed((v) => !v)}
                              className="text-textSecondary transition hover:text-textPrimary"
                              title={salaryRevealed ? "Hide salary" : "Reveal salary"}
                            >
                              {salaryRevealed ? <EyeOff size={14} /> : <Eye size={14} />}
                            </button>
                          </span>
                        ) : null
                      }
                    />
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
        </div>
      </PageLayout>
    </Layout>
  );
}
