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
  const approvalData = (approval.data || {}) as {changes?: Record<string, unknown>};
  const changes = (approvalData?.changes || {}) as Record<string, unknown>;

  type UserChanges = {
    firstName?: string;
    lastName?: string;
    email?: string;
  };

  const FIELDS = [
    {key: "firstName", label: "First Name", order: 1},
    {key: "lastName", label: "Last Name", order: 2},
    {key: "email", label: "Email", order: 3},
  ] as const;

  type FieldKey = (typeof FIELDS)[number]["key"];

  const normalize = (v?: unknown) => String(v ?? "").trim();

  const computeChangedEntries = (c: Partial<Record<FieldKey, unknown>>, u: UserChanges) => {
    return FIELDS.filter(({key}) => c[key] !== undefined && c[key] !== null)
      .filter(({key}) => normalize(c[key]) !== normalize(u[key]))
      .sort((a, b) => a.order - b.order)
      .map(({key, label}) => ({label, value: normalize(c[key])}));
  };

  const changedEntries = computeChangedEntries(changes as Partial<Record<FieldKey, unknown>>, {
    firstName: userRequest.firstName,
    lastName: userRequest.lastName,
    email: userRequest.email,
  });

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

      {changedEntries.length > 0 && (
        <div className="flex flex-col gap-3">
          <h2>Requested Changes</h2>
          {changedEntries.map((item) => (
            <Detail key={item.label} label={item.label} value={item.value} />
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
