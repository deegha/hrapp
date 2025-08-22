import {useApprovalStore} from "@/store/approvalStore";
import {fetchUser} from "@/services";
import useSWR from "swr";
import {Button, Detail, StatusTag} from "@/components";
import moment from "moment";
import {Check, Trash} from "react-feather";

import {useApproval} from "./useApprove";

export function ApprovalDetailsDepartment() {
  const {approval} = useApprovalStore();

  const {handleApproval, loading, handleConfirmation} = useApproval();

  const {data} = useSWR(
    `fetch-user-${approval.id}`,
    async () => await fetchUser(approval.targetId.toString()),
  );

  if (!data) return <div>No data found</div>;

  const userRequest = data.data;

  // Extract department and employee details from title
  // Format examples:
  // "FirstName LastName requests to assign FirstName LastName to department "DeptName" (Employee ID: X, Department ID: Y)"
  // "FirstName LastName requests to remove FirstName LastName from department "DeptName" (Employee ID: X, Department ID: Y, Action: REMOVE)"

  const titleMatch = approval.title.match(
    /Employee ID: (\d+), Department ID: (\d+)(?:, Action: (REMOVE))?/,
  );
  const isRemovalRequest = titleMatch?.[3] === "REMOVE";
  const departmentName =
    approval.title.match(/(?:to|from) department "([^"]+)"/)?.[1] || "Unknown Department";

  const actionPastTense = isRemovalRequest ? "removed from" : "assigned to";

  return (
    <div className="flex flex-col gap-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[32px] font-semibold uppercase">{approval?.title}</h1>
          <p className="text-xxs text-textSecondary">
            Created on {moment(approval.createdAt).format("yyyy-DD-mm : HH:mm")}
          </p>
        </div>
        <StatusTag status={approval.status} />
      </div>

      <div className="flex flex-col gap-3">
        <h2>Request Details</h2>
        <Detail
          label={"Request Type"}
          value={`Department ${isRemovalRequest ? "Removal" : "Assignment"}`}
        />
        <Detail label={"Department"} value={departmentName} />
        <Detail label={"Action"} value={`User will be ${actionPastTense} "${departmentName}"`} />
      </div>

      <div className="flex flex-col gap-3">
        <h2>Employee Details</h2>
        <Detail label={"Employee ID"} value={`EMP-${userRequest.employeeId}`} />
        <Detail label={"First Name"} value={userRequest.firstName} />
        <Detail label={"Last Name"} value={userRequest.lastName} />
        <Detail label={"Email"} value={userRequest.email} />
        {userRequest.Department && (
          <Detail label={"Current Department"} value={userRequest.Department.departmentName} />
        )}
      </div>

      {approval.status === "PENDING" && (
        <div className="flex w-full gap-3">
          <Button
            onClick={() =>
              handleApproval({
                itemId: userRequest?.employeeId as number,
                action: "APPROVED",
              })
            }
            loading={loading === "APPROVED" ? true : false}
          >
            <div className="flex items-center gap-1">
              <Check size={14} /> Approve {isRemovalRequest ? "Removal" : "Assignment"}
            </div>
          </Button>

          <Button
            loading={loading === "REJECTED" ? true : false}
            variant="danger"
            onClick={() => handleConfirmation(userRequest?.employeeId as number)}
          >
            <div className="flex items-center gap-1">
              <Trash size={14} />
              Reject Request
            </div>
          </Button>
        </div>
      )}
    </div>
  );
}
