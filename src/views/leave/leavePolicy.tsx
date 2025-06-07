import {Button, PageLayout, PolicySection, InputField} from "@/components";
import {useState, useEffect} from "react";
import useSWR from "swr";
import {fetchLeavePolicies, updateLeavePolicy} from "@/services";
import {TLeavePolicy} from "@/types";
import {useNotificationStore} from "@/store/notificationStore";

export function LeavePolicies() {
  const [edit, setEdit] = useState(false);
  const [requiredNotice, setRequiredNotice] = useState("5 day");
  const [policies, setPolicies] = useState<TLeavePolicy[]>([]);
  const [loading, setLoading] = useState(false);
  const {showNotification} = useNotificationStore();

  const {data, isLoading, mutate} = useSWR("leave-policies", async () => {
    const response = await fetchLeavePolicies();
    return response.data || [];
  });

  useEffect(() => {
    if (data) {
      setPolicies(data);
    }
  }, [data]);

  const handlePolicyUpdate = async (
    policyId: number,
    field: keyof TLeavePolicy,
    value: string | number | boolean,
  ) => {
    try {
      setLoading(true);
      const updateData: Record<string, unknown> & {id: number} = {id: policyId};
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (updateData as any)[field] = value;

      await updateLeavePolicy(updateData);

      // Update local state
      setPolicies((prev) =>
        prev.map((policy) => (policy.id === policyId ? {...policy, [field]: value} : policy)),
      );

      showNotification({
        message: "Leave policy updated successfully!",
        type: "success",
      });

      mutate(); // Refresh data
    } catch {
      showNotification({
        message: "Failed to update leave policy",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  if (isLoading) {
    return (
      <PageLayout pageName="Leave Policies">
        <div>Loading...</div>
      </PageLayout>
    );
  }

  // Transform policies to display format
  const entitlements = policies.map((policy) => ({
    id: policy.id,
    item: policy.name,
    value: `${policy.daysPerYear} days per year`,
    editValue: (
      <InputField
        value={policy.daysPerYear.toString()}
        onChange={(e) =>
          handlePolicyUpdate(policy.id, "daysPerYear", parseInt(e.target.value) || 0)
        }
      />
    ),
  }));

  const accrual = policies.map((policy) => ({
    id: policy.id,
    item: `${policy.name} Accrual Type`,
    value: policy.accrualType === "ALL_FROM_DAY_1" ? "All from Day 1" : "Half Day per Month",
    editValue: (
      <select
        value={policy.accrualType}
        onChange={(e) => handlePolicyUpdate(policy.id, "accrualType", e.target.value)}
        className="rounded border px-2 py-1"
      >
        <option value="ALL_FROM_DAY_1">All from Day 1</option>
        <option value="HALF_DAY_PER_MONTH">Half Day per Month</option>
      </select>
    ),
  }));

  const carryForward = policies.map((policy) => ({
    id: policy.id,
    item: `${policy.name} Carry Forward`,
    value: policy.canCarryForward ? "Allowed" : "Not Allowed",
    editValue: (
      <select
        value={policy.canCarryForward.toString()}
        onChange={(e) =>
          handlePolicyUpdate(policy.id, "canCarryForward", e.target.value === "true")
        }
        className="rounded border px-2 py-1"
      >
        <option value="true">Allowed</option>
        <option value="false">Not Allowed</option>
      </select>
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

        <div className="w-20">
          <Button onClick={() => setEdit(!edit)} loading={loading}>
            {edit ? "Save" : "Edit"}
          </Button>
        </div>
      </div>
    </PageLayout>
  );
}
