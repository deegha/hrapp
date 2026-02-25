import {useApprovalStore} from "@/store/approvalStore";
import useSWR from "swr";
import {Button, Detail, StatusTag} from "@/components";
import moment from "moment";
import {Check, Trash} from "react-feather";
import {useApproval} from "./useApprove";
import {fetchWFHRequest} from "@/services";

export function ApprovalDetailsWFH() {
  const {approval} = useApprovalStore();
  const {handleApproval, loading, handleConfirmation} = useApproval();

  const {data, isLoading} = useSWR(
    `fetch-wfh-${approval.id}`,
    async () => await fetchWFHRequest(approval.targetId.toString()),
  );

  if (!data) return <div>No data found</div>;

  const wfhRequest = data.data;

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

      {isLoading &&
        Array.from({length: 3}).map((_, idx) => (
          <div key={idx} className="h-5 w-32 animate-pulse rounded bg-gray-200"></div>
        ))}

      <div className="flex flex-col gap-3">
        <h2>WFH Request Details</h2>
        <Detail label={"Date"} value={moment(wfhRequest?.date).format("YYYY-MM-DD")} />
        <Detail label={"Status"} value={wfhRequest?.status} />
        <Detail
          label={"Requested On"}
          value={moment(wfhRequest?.createdAt).format("YYYY-MM-DD HH:mm")}
        />
        {wfhRequest?.note && (
          <Detail label={"Note"} value={wfhRequest.note} /> // 👈 add this
        )}
        {wfhRequest?.user && (
          <Detail
            label={"Requested By"}
            value={`${wfhRequest.user.firstName} ${wfhRequest.user.lastName}`}
          />
        )}
      </div>

      {approval.status === "PENDING" && (
        <div className="flex w-full gap-3">
          <Button
            onClick={() =>
              handleApproval({
                itemId: wfhRequest?.id as number,
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
            onClick={() => handleConfirmation(wfhRequest?.id as number)}
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
