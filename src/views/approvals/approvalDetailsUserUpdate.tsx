import {useApprovalStore} from "@/store/approvalStore";
import {fetchUser} from "@/services";
import useSWR from "swr";
import {Button, Detail, StatusTag} from "@/components";
import moment from "moment";
import {Check, Trash} from "react-feather";
import {useApproval} from "./useApprove";

export function ApprovalDetailsUserUpdate() {
  const {approval} = useApprovalStore();

  const {handleApproval, loading, handleConfirmation} = useApproval();

  const {data} = useSWR(
    `fetch-user-${approval.id}`,
    async () => await fetchUser(approval.targetId.toString()),
  );

  if (!data) return <div>No data found</div>;

  const userRequest = data.data;
  const changes = (approval.data || ({} as Record<string, unknown>)) as Record<string, unknown>;

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
        <h2>Current User Details</h2>
        <Detail label={"First Name"} value={userRequest.firstName} />
        <Detail label={"Last Name"} value={userRequest.lastName} />
        <Detail label={"Email"} value={userRequest.email} />
      </div>

      {Object.keys(changes).length > 0 && (
        <div className="flex flex-col gap-3">
          <h2>Requested Changes</h2>
          {Object.entries(changes).map(([key, value]) => (
            <Detail key={key} label={key} value={String(value)} />
          ))}
        </div>
      )}

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
              <Check size={14} /> Approve
            </div>
          </Button>

          <Button
            loading={loading === "REJECTED" ? true : false}
            variant="danger"
            onClick={() => handleConfirmation(userRequest?.employeeId as number)}
          >
            <div className="flex items-center gap-1">
              <Trash size={14} />
              Reject
            </div>
          </Button>
        </div>
      )}
    </div>
  );
}
