import { Button, PageLayout, PolicySection, InputField } from "@/components";
import { useState } from "react";

const entitlements = [
  { id: 1, item: "Annual Leave", value: "8 days per year" },
  { id: 2, item: "Casual Leave", value: "7 days per year" },
  { id: 3, item: "Medical Leave", value: "5 days per year" },
];

const accrual = [{ id: 1, item: "Accrual Frequency", value: "Monthly" }];
const carryForward = [
  { id: 1, item: "Maximum Carry Forward", value: "5 days" },
  { id: 2, item: "Expiry Date", value: "December 31st" },
];

const restricted = [
  { id: 1, item: "Restricted Dates", value: "December 15th - January 5th" },
];

export function LeavePolicies() {
  const [edit, setEdit] = useState(false);

  const [requiredNotice, setRequiredNotice] = useState("5 day");

  const leaveApprovalWorkflow = [
    {
      id: 1,
      item: "Approval levels",
      value: requiredNotice,
      editValue: (
        <InputField
          value={requiredNotice}
          onChange={(e) => setRequiredNotice(e.target.value)}
        />
      ),
    },
  ];

  return (
    <PageLayout pageName="Leave Policies">
      <div className="flex flex-col gap-10">
        <p className="text-textSecondary max-w-[600px] text-sm">
          Configure leave policies to define eligibility and accrual rules.
          These settings ensure accurate leave balance calculations and policy
          enforcement across your organization.
        </p>

        <div className="flex flex-col ">
          <PolicySection
            edit={edit}
            title="Leave Type And Entitlements"
            items={entitlements}
          />
        </div>
        <PolicySection edit={edit} title="Accrual Rule" items={accrual} />

        <PolicySection
          title="Carry Forward And Expiry"
          edit={edit}
          items={carryForward}
        />
        <PolicySection
          edit={edit}
          title="Leave Approval Workflows"
          items={leaveApprovalWorkflow}
        />
        <PolicySection
          edit={edit}
          title="Restricted Leave Periods"
          items={restricted}
        />

        <div className="w-20">
          <Button onClick={() => setEdit(true)}>Edit</Button>
        </div>
      </div>
    </PageLayout>
  );
}
