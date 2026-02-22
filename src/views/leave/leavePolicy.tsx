import {Button, PageLayout, PolicySection, InputField} from "@/components";
import {useState, useEffect, useMemo} from "react";
import useSWR from "swr";
import {fetchLeavePolicies, updateLeavePolicy, fetchEmploymentTypes} from "@/services";
import {TLeavePolicy} from "@/types";
import {useNotificationStore} from "@/store/notificationStore";
import {EntitlementsSection} from "./components/EntitlementsSection";
import {AccrualSection} from "./components/AccrualSection";
import {CarryForwardSection} from "./components/CarryForwardSection";
import {CreateLeaveTypeModal} from "./components/CreateLeaveTypeModal";
import {DeleteLeaveTypeModal} from "./components/DeleteLeaveTypeModal";

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

  // Delete confirmation modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteLeaveTypeId, setDeleteLeaveTypeId] = useState<number | null>(null);

  const {data, isLoading, mutate} = useSWR("leave-policies", async () => {
    const response = await fetchLeavePolicies();
    return response.data || [];
  });

  useEffect(() => {
    if (!data) return;
    const filteredPolicies = data.filter((policy) => policy.name !== "Lieu Leave");
    setPolicies(filteredPolicies);
    setTempPolicies(filteredPolicies);
  }, [data]);

  const handleLocalPolicyUpdate = (
    policyId: number,
    field: keyof TLeavePolicy,
    value: string | number | boolean,
  ) =>
    setTempPolicies((prev) =>
      prev.map((policy) => (policy.id === policyId ? {...policy, [field]: value} : policy)),
    );

  const handleEmploymentTypeDaysUpdate = (policyId: number, employmentType: string, days: number) =>
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

  const saveChanges = async () => {
    try {
      setLoading(true);
      const changedPolicies = tempPolicies.filter((tempPolicy) => {
        const originalPolicy = policies.find((policy) => policy.id === tempPolicy.id);
        return originalPolicy && JSON.stringify(tempPolicy) !== JSON.stringify(originalPolicy);
      });
      await Promise.all(changedPolicies.map((policy) => updateLeavePolicy(policy)));
      setPolicies(tempPolicies);
      showNotification({message: "Leave policies updated successfully!", type: "success"});
      mutate();
      setEdit(false);
    } catch {
      showNotification({message: "Failed to update leave policies", type: "error"});
    } finally {
      setLoading(false);
    }
  };

  const cancelEdit = () => {
    setTempPolicies(policies);
    setEdit(false);
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
          <EntitlementsSection
            edit={edit}
            policies={displayPolicies}
            employmentTypes={employmentTypes}
            onChangeDays={handleEmploymentTypeDaysUpdate}
            onDelete={confirmDelete}
          />
        </div>
        <AccrualSection
          edit={edit}
          policies={displayPolicies}
          onChange={(id, value) => handleLocalPolicyUpdate(id, "accrualType", value)}
        />

        <CarryForwardSection
          edit={edit}
          policies={displayPolicies}
          onChange={(id, value) => handleLocalPolicyUpdate(id, "canCarryForward", value)}
        />
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
        <CreateLeaveTypeModal
          open={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          employmentTypes={employmentTypes}
          onCreated={() => mutate()}
        />

        {/* Delete Confirmation Modal */}
        <DeleteLeaveTypeModal
          open={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          leaveTypeId={deleteLeaveTypeId}
          onDeleted={() => {
            mutate();
            setDeleteLeaveTypeId(null);
          }}
        />
      </div>
    </PageLayout>
  );
}
