import {useState} from "react";
import useSWR from "swr";
import {NoDataFoundComponent, EmploymentTypesShimmer, Button} from "@/components";
import {
  fetchDepartments,
  createDepartment,
  updateDepartment,
  deleteDepartment,
  fetchEmploymentTypes,
  createEmploymentType,
  deleteEmploymentType,
  fetchJobRoles,
  createJobRole,
  updateJobRole,
  deleteJobRole,
} from "@/services/organizationService";
import {useNotificationStore} from "@/store/notificationStore";
import {useConfirmationModalStore} from "@/store/useConfirmationModalStore";
import {CreateDepartmentModal} from "@/views/organization/createDepartmentModal";
import {UpdateDepartmentModal} from "@/views/organization/updateDepartmentModal";
import {CreateEmploymentTypeModal} from "@/views/organization/createEmploymentTypeModal";
import {
  TCreateDepartmentPayload,
  TUpdateDepartmentPayload,
  TCreateEmploymentTypePayload,
  TJobRole,
} from "@/types/organization";
import {Trash, Edit, Layers, Briefcase, Users} from "react-feather";

/* ── inline modal ──────────────────────────────────────── */
function SimpleModal({
  isOpen,
  title,
  value,
  onChange,
  description,
  onDescriptionChange,
  onSubmit,
  onClose,
  loading,
  placeholder,
}: {
  isOpen: boolean;
  title: string;
  value: string;
  onChange: (v: string) => void;
  description?: string;
  onDescriptionChange?: (v: string) => void;
  onSubmit: () => void;
  onClose: () => void;
  loading: boolean;
  placeholder?: string;
}) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-xl">
        <h2 className="mb-4 text-sm font-semiBold text-textPrimary">{title}</h2>
        <div className="mb-3 flex flex-col gap-1">
          <label className="text-xs font-semibold text-textSecondary">Title</label>
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder ?? "Enter title"}
            className="w-full rounded-md border border-border bg-white p-2 text-sm text-textPrimary focus:outline-none focus:ring-2 focus:ring-primary"
            autoFocus
            onKeyDown={(e) => e.key === "Enter" && !onDescriptionChange && onSubmit()}
          />
        </div>
        {onDescriptionChange !== undefined && (
          <div className="mb-4 flex flex-col gap-1">
            <label className="text-xs font-semibold text-textSecondary">
              Description (optional)
            </label>
            <textarea
              value={description ?? ""}
              onChange={(e) => onDescriptionChange(e.target.value)}
              placeholder="Brief description of this role..."
              rows={3}
              className="w-full resize-none rounded-md border border-border bg-white p-2 text-sm text-textPrimary focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        )}
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-border px-4 py-2 text-sm font-semibold text-textPrimary hover:bg-background"
          >
            Cancel
          </button>
          <Button onClick={onSubmit} disabled={!value.trim() || loading}>
            Save
          </Button>
        </div>
      </div>
    </div>
  );
}

/* ── Departments section ───────────────────────────────── */
function DepartmentsSection() {
  const {showNotification} = useNotificationStore();
  const {openModal} = useConfirmationModalStore();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isUpdateOpen, setIsUpdateOpen] = useState(false);
  const [selected, setSelected] = useState<{id: number; name: string} | null>(null);
  const {data, isLoading, mutate} = useSWR("departments", fetchDepartments);
  const departments = data?.data ?? [];

  const handleCreate = async (form: TCreateDepartmentPayload) => {
    try {
      await createDepartment(form);
      showNotification({message: "Department created", type: "success"});
      setIsCreateOpen(false);
      mutate();
    } catch {
      showNotification({message: "Failed to create department", type: "error"});
    }
  };

  const handleUpdate = async (form: TUpdateDepartmentPayload) => {
    if (!selected) return;
    try {
      await updateDepartment(selected.id, form);
      showNotification({message: "Department updated", type: "success"});
      setIsUpdateOpen(false);
      setSelected(null);
      mutate();
    } catch {
      showNotification({message: "Failed to update department", type: "error"});
    }
  };

  const handleDelete = (id: number) => {
    openModal({
      title: "Delete Department",
      description: "Are you sure you want to delete this department?",
      onConfirm: async () => {
        try {
          await deleteDepartment(id);
          showNotification({message: "Department deleted", type: "success"});
          mutate();
        } catch {
          showNotification({message: "Failed to delete department", type: "error"});
        }
      },
      onCancel: () => {},
    });
  };

  return (
    <div className="rounded-xl border border-border bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-border bg-background px-6 py-4">
        <div className="flex items-center gap-2">
          <Layers size={15} className="text-primary" />
          <h2 className="text-sm font-semiBold text-textPrimary">Departments</h2>
          <span className="bg-primary/10 ml-1 rounded-full px-2 py-0.5 text-xs font-medium text-primary">
            {departments.length}
          </span>
        </div>
        <button
          onClick={() => setIsCreateOpen(true)}
          className="hover:bg-primary/90 shrink-0 rounded-md bg-primary px-3 py-1.5 text-xs font-semibold text-white"
        >
          Add Department
        </button>
      </div>
      <div className="px-6 pb-2">
        {isLoading ? (
          <div className="py-4">
            <EmploymentTypesShimmer />
          </div>
        ) : departments.length === 0 ? (
          <div className="py-6">
            <NoDataFoundComponent />
          </div>
        ) : (
          departments.map((d) => (
            <div
              key={d.id}
              className="flex items-center justify-between border-t border-border py-3"
            >
              <div>
                <p className="text-sm font-semibold text-textPrimary">{d.departmentName}</p>
                <p className="text-xs text-textSecondary">
                  Created{" "}
                  {new Date(d.createdAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </p>
              </div>
              <div className="flex gap-1">
                <button
                  onClick={() => {
                    setSelected({id: d.id, name: d.departmentName});
                    setIsUpdateOpen(true);
                  }}
                  className="rounded-md p-2 text-blue-500 hover:bg-blue-50"
                >
                  <Edit size={15} />
                </button>
                <button
                  onClick={() => handleDelete(d.id)}
                  className="rounded-md p-2 text-red-500 hover:bg-red-50"
                >
                  <Trash size={15} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
      <CreateDepartmentModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSubmit={handleCreate}
      />
      <UpdateDepartmentModal
        isOpen={isUpdateOpen}
        onClose={() => {
          setIsUpdateOpen(false);
          setSelected(null);
        }}
        onSubmit={handleUpdate}
        initialName={selected?.name ?? ""}
      />
    </div>
  );
}

/* ── Employment Types section ──────────────────────────── */
function EmploymentTypesSection() {
  const {showNotification} = useNotificationStore();
  const {openModal} = useConfirmationModalStore();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const {data, isLoading, mutate} = useSWR("employment-types", fetchEmploymentTypes);
  const types = data?.data ?? [];

  const handleCreate = async (form: TCreateEmploymentTypePayload) => {
    try {
      await createEmploymentType(form);
      showNotification({message: "Employment type created", type: "success"});
      setIsCreateOpen(false);
      mutate();
    } catch {
      showNotification({message: "Failed to create employment type", type: "error"});
    }
  };

  const handleDelete = (id: number) => {
    openModal({
      title: "Delete Employment Type",
      description: "Are you sure you want to delete this employment type?",
      onConfirm: async () => {
        try {
          await deleteEmploymentType(id);
          showNotification({message: "Employment type deleted", type: "success"});
          mutate();
        } catch {
          showNotification({message: "Failed to delete employment type", type: "error"});
        }
      },
      onCancel: () => {},
    });
  };

  return (
    <div className="rounded-xl border border-border bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-border bg-background px-6 py-4">
        <div className="flex items-center gap-2">
          <Briefcase size={15} className="text-primary" />
          <h2 className="text-sm font-semiBold text-textPrimary">Employment Types</h2>
          <span className="bg-primary/10 ml-1 rounded-full px-2 py-0.5 text-xs font-medium text-primary">
            {types.length}
          </span>
        </div>
        <button
          onClick={() => setIsCreateOpen(true)}
          className="hover:bg-primary/90 shrink-0 rounded-md bg-primary px-3 py-1.5 text-xs font-semibold text-white"
        >
          Add Type
        </button>
      </div>
      <div className="px-6 pb-2">
        {isLoading ? (
          <div className="py-4">
            <EmploymentTypesShimmer />
          </div>
        ) : types.length === 0 ? (
          <div className="py-6">
            <NoDataFoundComponent />
          </div>
        ) : (
          types.map((t) => (
            <div
              key={t.id}
              className="flex items-center justify-between border-t border-border py-3"
            >
              <div>
                <p className="text-sm font-semibold text-textPrimary">{t.typeLabel}</p>
                <p className="text-xs text-textSecondary">
                  Created{" "}
                  {new Date(t.createdAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </p>
              </div>
              <div>
                {t.organizationId === null ? (
                  <span className="bg-primary/10 rounded-full px-2.5 py-1 text-xs font-medium text-primary">
                    System
                  </span>
                ) : (
                  <button
                    onClick={() => handleDelete(t.id)}
                    className="rounded-md p-2 text-red-500 hover:bg-red-50"
                  >
                    <Trash size={15} />
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
      <CreateEmploymentTypeModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSubmit={handleCreate}
      />
    </div>
  );
}

/* ── Job Roles section ─────────────────────────────────── */
function JobRolesSection() {
  const {showNotification} = useNotificationStore();
  const {openModal} = useConfirmationModalStore();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<TJobRole | null>(null);
  const [inputValue, setInputValue] = useState("");
  const [descriptionValue, setDescriptionValue] = useState("");
  const [saving, setSaving] = useState(false);
  const {data, isLoading, mutate} = useSWR("job-roles", fetchJobRoles);
  const jobRoles = data?.data ?? [];

  const openCreate = () => {
    setInputValue("");
    setDescriptionValue("");
    setIsCreateOpen(true);
  };
  const openEdit = (role: TJobRole) => {
    setInputValue(role.title);
    setDescriptionValue(role.description ?? "");
    setEditTarget(role);
  };

  const handleSave = async () => {
    if (!inputValue.trim()) return;
    setSaving(true);
    try {
      const payload = {title: inputValue.trim(), description: descriptionValue.trim() || undefined};
      if (editTarget) {
        await updateJobRole(editTarget.id, payload);
        showNotification({message: "Job role updated", type: "success"});
        setEditTarget(null);
      } else {
        await createJobRole(payload);
        showNotification({message: "Job role created", type: "success"});
        setIsCreateOpen(false);
      }
      setInputValue("");
      setDescriptionValue("");
      mutate();
    } catch {
      showNotification({message: "Failed to save job role", type: "error"});
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (id: number) => {
    openModal({
      title: "Delete Job Role",
      description: "Are you sure you want to delete this job role?",
      onConfirm: async () => {
        try {
          await deleteJobRole(id);
          showNotification({message: "Job role deleted", type: "success"});
          mutate();
        } catch {
          showNotification({message: "Failed to delete job role", type: "error"});
        }
      },
      onCancel: () => {},
    });
  };

  return (
    <div className="rounded-xl border border-border bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-border bg-background px-6 py-4">
        <div className="flex items-center gap-2">
          <Users size={15} className="text-primary" />
          <h2 className="text-sm font-semiBold text-textPrimary">Job Roles</h2>
          <span className="bg-primary/10 ml-1 rounded-full px-2 py-0.5 text-xs font-medium text-primary">
            {jobRoles.length}
          </span>
        </div>
        <button
          onClick={openCreate}
          className="hover:bg-primary/90 shrink-0 rounded-md bg-primary px-3 py-1.5 text-xs font-semibold text-white"
        >
          Add Job Role
        </button>
      </div>
      <div className="px-6 pb-2">
        {isLoading ? (
          <div className="py-4">
            <EmploymentTypesShimmer />
          </div>
        ) : jobRoles.length === 0 ? (
          <div className="py-6">
            <NoDataFoundComponent />
          </div>
        ) : (
          jobRoles.map((role) => (
            <div
              key={role.id}
              className="flex items-center justify-between border-t border-border py-3"
            >
              <div>
                <p className="text-sm font-semibold text-textPrimary">{role.title}</p>
                {role.description && (
                  <p className="text-xs text-textSecondary">{role.description}</p>
                )}
                <p className="text-xs text-textSecondary">
                  Created{" "}
                  {new Date(role.createdAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </p>
              </div>
              <div className="flex gap-1">
                <button
                  onClick={() => openEdit(role)}
                  className="rounded-md p-2 text-blue-500 hover:bg-blue-50"
                >
                  <Edit size={15} />
                </button>
                <button
                  onClick={() => handleDelete(role.id)}
                  className="rounded-md p-2 text-red-500 hover:bg-red-50"
                >
                  <Trash size={15} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <SimpleModal
        isOpen={isCreateOpen}
        title="Add Job Role"
        value={inputValue}
        onChange={setInputValue}
        description={descriptionValue}
        onDescriptionChange={setDescriptionValue}
        onSubmit={handleSave}
        onClose={() => {
          setIsCreateOpen(false);
          setInputValue("");
          setDescriptionValue("");
        }}
        loading={saving}
        placeholder="e.g. Software Engineer"
      />
      <SimpleModal
        isOpen={!!editTarget}
        title="Edit Job Role"
        value={inputValue}
        onChange={setInputValue}
        description={descriptionValue}
        onDescriptionChange={setDescriptionValue}
        onSubmit={handleSave}
        onClose={() => {
          setEditTarget(null);
          setInputValue("");
          setDescriptionValue("");
        }}
        loading={saving}
        placeholder="e.g. Software Engineer"
      />
    </div>
  );
}

/* ── Main export ───────────────────────────────────────── */
export function OrganizationSettings() {
  return (
    <div className="space-y-6">
      <DepartmentsSection />
      <EmploymentTypesSection />
      <JobRolesSection />
    </div>
  );
}
