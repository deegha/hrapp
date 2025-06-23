import {Button, PageLayout, PolicySection, InputField} from "@/components";
import {useState, useEffect} from "react";
import useSWR from "swr";
import {fetchLeavePolicies, updateLeavePolicy, createLeaveType} from "@/services";
import {TLeavePolicy, TCreateLeaveTypePayload} from "@/types";
import {useNotificationStore} from "@/store/notificationStore";
import {Listbox} from "@headlessui/react";
import {ChevronDown, Check, X} from "react-feather";
import clsx from "clsx";
import {EMPLOYMENT_TYPES, EmploymentType} from "@/constants/employmentTypes";

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

  // Create leave type modal state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createFormData, setCreateFormData] = useState<TCreateLeaveTypePayload>({
    name: "",
    daysPerYear: 10,
    accrualType: "ALL_FROM_DAY_1",
    canCarryForward: false,
    daysPerEmploymentType: {
      [EMPLOYMENT_TYPES.FULLTIME]: 10,
      [EMPLOYMENT_TYPES.PROBATION]: 5,
      [EMPLOYMENT_TYPES.INTERN]: 1,
    },
  });
  const [createLoading, setCreateLoading] = useState(false);

  const {data, isLoading, mutate} = useSWR("leave-policies", async () => {
    const response = await fetchLeavePolicies();
    return response.data || [];
  });

  useEffect(() => {
    if (data) {
      setPolicies(data);
      setTempPolicies(data); // Initialize temp state with current data
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
    employmentType: EmploymentType,
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
      setCreateFormData({
        name: "",
        daysPerYear: 10,
        accrualType: "ALL_FROM_DAY_1",
        canCarryForward: false,
        daysPerEmploymentType: {
          [EMPLOYMENT_TYPES.FULLTIME]: 10,
          [EMPLOYMENT_TYPES.PROBATION]: 5,
          [EMPLOYMENT_TYPES.INTERN]: 1,
        },
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
    const fulltimeDays =
      policy.daysPerEmploymentType?.[EMPLOYMENT_TYPES.FULLTIME] ?? policy.daysPerYear;
    const probationDays =
      policy.daysPerEmploymentType?.[EMPLOYMENT_TYPES.PROBATION] ?? policy.daysPerYear;
    const internDays =
      policy.daysPerEmploymentType?.[EMPLOYMENT_TYPES.INTERN] ?? policy.daysPerYear;

    return {
      id: policy.id,
      item: policy.name,
      value: edit
        ? ""
        : `Fulltime: ${fulltimeDays}, Probation: ${probationDays}, Intern: ${internDays} days per year`,
      editValue: edit ? (
        <div className="flex gap-4">
          <div className="flex flex-col">
            <label className="mb-1 text-xs font-medium text-gray-600">Fulltime</label>
            <InputField
              value={fulltimeDays.toString()}
              onChange={(e) =>
                handleEmploymentTypeDaysUpdate(
                  policy.id,
                  EMPLOYMENT_TYPES.FULLTIME,
                  parseInt(e.target.value) || 0,
                )
              }
              className="w-20"
            />
          </div>
          <div className="flex flex-col">
            <label className="mb-1 text-xs font-medium text-gray-600">Probation</label>
            <InputField
              value={probationDays.toString()}
              onChange={(e) =>
                handleEmploymentTypeDaysUpdate(
                  policy.id,
                  EMPLOYMENT_TYPES.PROBATION,
                  parseInt(e.target.value) || 0,
                )
              }
              className="w-20"
            />
          </div>
          <div className="flex flex-col">
            <label className="mb-1 text-xs font-medium text-gray-600">Intern</label>
            <InputField
              value={internDays.toString()}
              onChange={(e) =>
                handleEmploymentTypeDaysUpdate(
                  policy.id,
                  EMPLOYMENT_TYPES.INTERN,
                  parseInt(e.target.value) || 0,
                )
              }
              className="w-20"
            />
          </div>
        </div>
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
                    <div>
                      <label className="mb-1 block text-xs font-medium text-gray-600">
                        Fulltime
                      </label>
                      <InputField
                        value={
                          createFormData.daysPerEmploymentType?.[
                            EMPLOYMENT_TYPES.FULLTIME
                          ]?.toString() || "10"
                        }
                        onChange={(e) =>
                          setCreateFormData((prev) => ({
                            ...prev,
                            daysPerEmploymentType: {
                              ...prev.daysPerEmploymentType,
                              [EMPLOYMENT_TYPES.FULLTIME]: parseInt(e.target.value) || 0,
                            },
                          }))
                        }
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-medium text-gray-600">
                        Probation
                      </label>
                      <InputField
                        value={
                          createFormData.daysPerEmploymentType?.[
                            EMPLOYMENT_TYPES.PROBATION
                          ]?.toString() || "5"
                        }
                        onChange={(e) =>
                          setCreateFormData((prev) => ({
                            ...prev,
                            daysPerEmploymentType: {
                              ...prev.daysPerEmploymentType,
                              [EMPLOYMENT_TYPES.PROBATION]: parseInt(e.target.value) || 0,
                            },
                          }))
                        }
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-medium text-gray-600">Intern</label>
                      <InputField
                        value={
                          createFormData.daysPerEmploymentType?.[
                            EMPLOYMENT_TYPES.INTERN
                          ]?.toString() || "1"
                        }
                        onChange={(e) =>
                          setCreateFormData((prev) => ({
                            ...prev,
                            daysPerEmploymentType: {
                              ...prev.daysPerEmploymentType,
                              [EMPLOYMENT_TYPES.INTERN]: parseInt(e.target.value) || 0,
                            },
                          }))
                        }
                      />
                    </div>
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
                  variant="danger"
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
      </div>
    </PageLayout>
  );
}
