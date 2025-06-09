import {Button, PageLayout, PolicySection, InputField} from "@/components";
import {useState, useEffect} from "react";
import useSWR from "swr";
import {fetchLeavePolicies, updateLeavePolicy} from "@/services";
import {TLeavePolicy} from "@/types";
import {useNotificationStore} from "@/store/notificationStore";
import {Listbox} from "@headlessui/react";
import {ChevronDown, Check} from "react-feather";
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

  if (isLoading) {
    return (
      <PageLayout pageName="Leave Policies">
        <div>Loading...</div>
      </PageLayout>
    );
  }

  // Use tempPolicies for display during edit mode
  const displayPolicies = edit ? tempPolicies : policies;

  // Transform policies to display format
  const entitlements = displayPolicies.map((policy) => ({
    id: policy.id,
    item: policy.name,
    value: `${policy.daysPerYear} days per year`,
    editValue: (
      <InputField
        value={policy.daysPerYear.toString()}
        onChange={(e) =>
          handleLocalPolicyUpdate(policy.id, "daysPerYear", parseInt(e.target.value) || 0)
        }
      />
    ),
  }));

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
    <PageLayout pageName="Leave Policies">
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
      </div>
    </PageLayout>
  );
}
