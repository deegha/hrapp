import {Button, PageLayout, PolicySection, InputField} from "@/components";
import {useState, useEffect, useMemo} from "react";
import useSWR from "swr";
import {
  fetchLeavePolicies,
  updateLeavePolicy,
  createLeaveType,
  deleteLeaveType,
  fetchEmploymentTypes,
} from "@/services";
import {TLeavePolicy, TCreateLeaveTypePayload} from "@/types";
import {useNotificationStore} from "@/store/notificationStore";
import {Listbox} from "@headlessui/react";
import {ChevronDown, Check, X, Trash2} from "react-feather";
import clsx from "clsx";

// Custom dropdown without text truncation
const PolicyDropdown = ({
  value,
  options,
  onChange,
}: {
  value: string;
  options: {label: string; value: string}[];
  onChange: (value: string) => void;
}) => {
  const selected = options.find((opt) => opt.value === value) || null;

  return (
    <Listbox value={selected} onChange={(val) => onChange(val?.value || "")}>
      <div className="relative min-w-[200px]">
        <Listbox.Button className="relative w-full cursor-default rounded-md border border-border py-2 pl-3 pr-10 text-left text-sm">
          <span className="block">{selected?.label || "Select option"}</span>
          <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
            <ChevronDown className="size-4 text-gray-400" />
          </span>
        </Listbox.Button>
        <Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white text-sm shadow-lg ring-1 ring-black/5 focus:outline-none">
          {options.map((option) => (
            <Listbox.Option key={option.value} value={option}>
              {({active, selected}) => (
                <li
                  className={clsx(
                    "relative cursor-pointer select-none list-none py-2 pl-10 pr-4",
                    active ? "bg-gray-100 text-gray-900" : "text-gray-700",
                  )}
                >
                  <span
                    className={clsx("block", {
                      "font-medium": selected,
                      "font-normal": !selected,
                    })}
                  >
                    {option.label}
                  </span>
                  {selected && (
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-primary">
                      <Check size={16} />
                    </span>
                  )}
                </li>
              )}
            </Listbox.Option>
          ))}
        </Listbox.Options>
      </div>
    </Listbox>
  );
};

export function LeavePolicies() {
  const [edit, setEdit] = useState(false);
  const [requiredNotice, setRequiredNotice] = useState("5 day");
  const [policies, setPolicies] = useState<TLeavePolicy[]>([]);
  const [loading, setLoading] = useState(false);
  const {showNotification} = useNotificationStore();

  // Local state for temporary changes during editing
  const [tempPolicies, setTempPolicies] = useState<TLeavePolicy[]>([]);

  // Fetch employment types
  const {data: employmentTypesData} = useSWR("employment-types", fetchEmploymentTypes);
  const employmentTypes = useMemo(() => employmentTypesData?.data || [], [employmentTypesData]);

  // Create leave type modal state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createFormData, setCreateFormData] = useState<TCreateLeaveTypePayload>({
    name: "",
    daysPerYear: 10,
    accrualType: "ALL_FROM_DAY_1",
    canCarryForward: false,
    daysPerEmploymentType: {},
  });
  const [createLoading, setCreateLoading] = useState(false);

  // Delete confirmation modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteLeaveTypeId, setDeleteLeaveTypeId] = useState<number | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const {data, isLoading, mutate} = useSWR("leave-policies", async () => {
    const response = await fetchLeavePolicies();
    return response.data || [];
  });

  // Initialize createFormData with default days for all employment types
  useEffect(() => {
    if (employmentTypes.length > 0) {
      const defaultDays: Record<string, number> = {};
      employmentTypes.forEach((type) => {
        defaultDays[type.typeLabel] = 10; // Default 10 days
      });
      setCreateFormData((prev) => ({
        ...prev,
        daysPerEmploymentType: defaultDays,
      }));
    }
  }, [employmentTypes]);

  useEffect(() => {
    if (data) {
      // Filter out "Lieu Leave" as it's a special leave type that shouldn't be manageable via UI
      const filteredData = data.filter((policy) => policy.name !== "Lieu Leave");
      setPolicies(filteredData);
      setTempPolicies(filteredData); // Initialize temp state with current data
    }
  }, [data]);

  const handleLocalPolicyUpdate = (
    policyId: number,
    field: keyof TLeavePolicy,
    value: string | number | boolean,
  ) => {
    // Update only local temp state, don't save to server
    setTempPolicies((prev) =>
      prev.map((policy) => (policy.id === policyId ? {...policy, [field]: value} : policy)),
    );
  };

  const handleEmploymentTypeDaysUpdate = (
    policyId: number,
    employmentType: string,
    days: number,
  ) => {
    setTempPolicies((prev) =>
      prev.map((policy) =>
        policy.id === policyId
          ? {
              ...policy,
              daysPerEmploymentType: {
                ...policy.daysPerEmploymentType,
                [employmentType]: days,
              },
            }
          : policy,
      ),
    );
  };

  const saveChanges = async () => {
    try {
      setLoading(true);

      // Find policies that have changed
      const changedPolicies = tempPolicies.filter((tempPolicy) => {
        const originalPolicy = policies.find((p) => p.id === tempPolicy.id);
        return originalPolicy && JSON.stringify(tempPolicy) !== JSON.stringify(originalPolicy);
      });

      // Update each changed policy
      for (const policy of changedPolicies) {
        await updateLeavePolicy(policy);
      }

      // Update the main state with temp changes
      setPolicies(tempPolicies);

      showNotification({
        message: "Leave policies updated successfully!",
        type: "success",
      });

      mutate(); // Refresh data
      setEdit(false); // Exit edit mode
    } catch {
      showNotification({
        message: "Failed to update leave policies",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const cancelEdit = () => {
    // Reset temp state to original data
    setTempPolicies(policies);
    setEdit(false);
  };

  const handleCreateLeaveType = async () => {
    try {
      setCreateLoading(true);

      await createLeaveType(createFormData);

      showNotification({
        message: "Leave type created successfully!",
        type: "success",
      });

      // Reset form and close modal
      const defaultDays: Record<string, number> = {};
      employmentTypes.forEach((type) => {
        defaultDays[type.typeLabel] = 10; // Default 10 days
      });
      setCreateFormData({
        name: "",
        daysPerYear: 10,
        accrualType: "ALL_FROM_DAY_1",
        canCarryForward: false,
        daysPerEmploymentType: defaultDays,
      });
      setShowCreateModal(false);

      // Refresh data
      mutate();
    } catch (error) {
      // Check if it's a string error message from API
      const errorMessage = typeof error === "string" ? error : "Failed to create leave type";

      showNotification({
        message: errorMessage,
        type: "error",
      });
    } finally {
      setCreateLoading(false);
    }
  };

  const handleDeleteLeaveType = async () => {
    if (!deleteLeaveTypeId) return;

    try {
      setDeleteLoading(true);

      await deleteLeaveType(deleteLeaveTypeId);

      showNotification({
        message: "Leave type deleted successfully!",
        type: "success",
      });

      // Refresh data
      mutate();
      setShowDeleteModal(false);
      setDeleteLeaveTypeId(null);
    } catch (error) {
      const errorMessage = typeof error === "string" ? error : "Failed to delete leave type";

      showNotification({
        message: errorMessage,
        type: "error",
      });
    } finally {
      setDeleteLoading(false);
    }
  };

  const confirmDelete = (leaveTypeId: number) => {
    setDeleteLeaveTypeId(leaveTypeId);
    setShowDeleteModal(true);
  };

  if (isLoading) {
    return (
      <PageLayout pageName="Leave Policies">
        <div>Loading...</div>
      </PageLayout>
    );
  }

  // Use tempPolicies for display during edit mode
  const displayPolicies = edit ? tempPolicies : policies;

  // Transform policies to display format with employment type columns
  const entitlements = displayPolicies.map((policy) => {
    // Generate employment type days dynamically
    const employmentTypeDays = employmentTypes.map((empType) => {
      const days = policy.daysPerEmploymentType?.[empType.typeLabel] ?? policy.daysPerYear;
      return {typeLabel: empType.typeLabel, days};
    });

    return {
      id: policy.id,
      item: policy.name,
      value: edit
        ? ""
        : employmentTypeDays.map((emp) => `${emp.typeLabel}: ${emp.days}`).join(", ") +
          " days per year",
      editValue: edit ? (
        <div className="flex flex-wrap gap-4">
          {employmentTypes.map((empType) => {
            const days = policy.daysPerEmploymentType?.[empType.typeLabel] ?? policy.daysPerYear;
            return (
              <div key={empType.typeLabel} className="flex flex-col">
                <label className="mb-1 text-xs font-medium text-gray-600">
                  {empType.typeLabel}
                </label>
                <InputField
                  value={days.toString()}
                  onChange={(e) =>
                    handleEmploymentTypeDaysUpdate(
                      policy.id,
                      empType.typeLabel,
                      parseInt(e.target.value) || 0,
                    )
                  }
                  className="w-20"
                />
              </div>
            );
          })}
        </div>
      ) : undefined,
      action: !edit ? (
        <button
          onClick={() => confirmDelete(policy.id)}
          className="flex items-center justify-center rounded-md p-2 text-red-500 hover:bg-red-50 hover:text-red-700"
          title="Delete leave type"
        >
          <Trash2 size={16} />
        </button>
      ) : undefined,
    };
  });

  const accrualOptions = [
    {label: "All from Day 1", value: "ALL_FROM_DAY_1"},
    {label: "Half Day per Month", value: "HALF_DAY_PER_MONTH"},
  ];

  const accrual = displayPolicies.map((policy) => ({
    id: policy.id,
    item: `${policy.name} Accrual Type`,
    value: policy.accrualType === "ALL_FROM_DAY_1" ? "All from Day 1" : "Half Day per Month",
    editValue: (
      <div className="w-fit min-w-[200px]">
        <PolicyDropdown
          value={policy.accrualType}
          options={accrualOptions}
          onChange={(value) => handleLocalPolicyUpdate(policy.id, "accrualType", value)}
        />
      </div>
    ),
  }));

  const carryForwardOptions = [
    {label: "Allowed", value: "true"},
    {label: "Not Allowed", value: "false"},
  ];

  const carryForward = displayPolicies.map((policy) => ({
    id: policy.id,
    item: `${policy.name} Carry Forward`,
    value: policy.canCarryForward ? "Allowed" : "Not Allowed",
    editValue: (
      <div className="w-fit min-w-[200px]">
        <PolicyDropdown
          value={policy.canCarryForward.toString()}
          options={carryForwardOptions}
          onChange={(value) =>
            handleLocalPolicyUpdate(policy.id, "canCarryForward", value === "true")
          }
        />
      </div>
    ),
  }));

  const leaveApprovalWorkflow = [
    {
      id: 1,
      item: "Approval levels",
      value: requiredNotice,
      editValue: (
        <InputField value={requiredNotice} onChange={(e) => setRequiredNotice(e.target.value)} />
      ),
    },
  ];

  const restricted = [{id: 1, item: "Restricted Dates", value: "December 15th - January 5th"}];

  return (
    <PageLayout
      pageName="Leave Policies"
      actionButton={
        !edit && <Button onClick={() => setShowCreateModal(true)}>ADD NEW LEAVE TYPE</Button>
      }
    >
      <div className="flex flex-col gap-10">
        <p className="max-w-[600px] text-sm text-textSecondary">
          Configure leave policies to define eligibility and accrual rules. These settings ensure
          accurate leave balance calculations and policy enforcement across your organization.
        </p>

        <div className="flex flex-col">
          <PolicySection edit={edit} title="Leave Type And Entitlements" items={entitlements} />
        </div>
        <PolicySection edit={edit} title="Accrual Rule" items={accrual} />

        <PolicySection title="Carry Forward And Expiry" edit={edit} items={carryForward} />
        <PolicySection edit={edit} title="Leave Approval Workflows" items={leaveApprovalWorkflow} />
        <PolicySection edit={edit} title="Restricted Leave Periods" items={restricted} />

        <div className="flex gap-3">
          {edit ? (
            <>
              <div className="w-20">
                <Button onClick={saveChanges} loading={loading}>
                  Save
                </Button>
              </div>
              <div className="w-20">
                <Button onClick={cancelEdit} variant="secondary" disabled={loading}>
                  Cancel
                </Button>
              </div>
            </>
          ) : (
            <div className="w-20">
              <Button onClick={() => setEdit(true)}>Edit</Button>
            </div>
          )}
        </div>

        {/* Create Leave Type Modal */}
        {showCreateModal && (
          <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/30 backdrop-blur-sm"
            onClick={() => setShowCreateModal(false)}
          >
            <div
              className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-800">Create New Leave Type</h2>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Leave Type Name
                  </label>
                  <InputField
                    value={createFormData.name}
                    onChange={(e) => setCreateFormData((prev) => ({...prev, name: e.target.value}))}
                    placeholder="e.g., Paternity Leave"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Days Per Employment Type
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {employmentTypes.map((empType) => (
                      <div key={empType.typeLabel}>
                        <label className="mb-1 block text-xs font-medium text-gray-600">
                          {empType.typeLabel}
                        </label>
                        <InputField
                          value={
                            createFormData.daysPerEmploymentType?.[empType.typeLabel]?.toString() ||
                            "10"
                          }
                          onChange={(e) =>
                            setCreateFormData((prev) => ({
                              ...prev,
                              daysPerEmploymentType: {
                                ...prev.daysPerEmploymentType,
                                [empType.typeLabel]: parseInt(e.target.value) || 0,
                              },
                            }))
                          }
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Accrual Type
                  </label>
                  <PolicyDropdown
                    value={createFormData.accrualType}
                    options={accrualOptions}
                    onChange={(value) =>
                      setCreateFormData((prev) => ({
                        ...prev,
                        accrualType: value as "ALL_FROM_DAY_1" | "HALF_DAY_PER_MONTH",
                      }))
                    }
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Carry Forward
                  </label>
                  <PolicyDropdown
                    value={createFormData.canCarryForward.toString()}
                    options={carryForwardOptions}
                    onChange={(value) =>
                      setCreateFormData((prev) => ({
                        ...prev,
                        canCarryForward: value === "true",
                      }))
                    }
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <Button
                  onClick={() => setShowCreateModal(false)}
                  variant="secondary"
                  disabled={createLoading}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateLeaveType}
                  variant="primary"
                  loading={createLoading}
                  disabled={!createFormData.name.trim()}
                >
                  Create Leave Type
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteModal && (
          <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/30 backdrop-blur-sm"
            onClick={() => setShowDeleteModal(false)}
          >
            <div
              className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-800">Delete Leave Type</h2>
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="mb-6">
                <p className="text-sm text-gray-600">
                  Are you sure you want to delete this leave type? This action cannot be undone and
                  will affect any related leave policies.
                </p>
              </div>

              <div className="flex justify-end space-x-3">
                <Button
                  onClick={() => setShowDeleteModal(false)}
                  variant="secondary"
                  disabled={deleteLoading}
                >
                  Cancel
                </Button>
                <Button onClick={handleDeleteLeaveType} variant="danger" loading={deleteLoading}>
                  Delete
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </PageLayout>
  );
}
