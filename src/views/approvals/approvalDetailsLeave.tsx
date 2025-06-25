import {useApprovalStore} from "@/store/approvalStore";
import {fetchLeaveRequest} from "@/services";
import useSWR from "swr";
import {Button, StatusTag} from "@/components";
import moment from "moment";
import {useLeaveTypes} from "@/hooks/useLeaveTypes";
import {Check, Trash, Paperclip} from "react-feather";

import {useApproval} from "./useApprove";
export function ApprovalDetailsLeave() {
  const {approval} = useApprovalStore();
  const {leaveTypes} = useLeaveTypes();

  const {handleApproval, loading, handleConfirmation} = useApproval();

  const {data, isLoading} = useSWR(
    `fetch-leave-${approval.id}`,
    async () => await fetchLeaveRequest(approval.targetId.toString()),
  );

  if (!data) <div>No data found</div>;

  const leaveRequest = data?.data;

  return (
    <div className="flex flex-col gap-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[32px] font-semibold uppercase">{approval?.title}</h1>
          <p className="text-xxs text-textSecondary">
            Created on {moment(leaveRequest?.createdAt).format("yyyy-DD-mm : HH:mm")}
          </p>
        </div>
        <StatusTag status={approval.status} />
      </div>

      {isLoading &&
        Array.from({length: 3}).map((_, idx) => (
          <div key={idx} className="h-5 w-32 animate-pulse rounded bg-gray-200"></div>
        ))}

      <div className="flex flex-col gap-3">
        <h2>Leave dates</h2>
        {leaveRequest?.leaves?.map((leave) => (
          <div key={leave.leaveDate} className="text-sm text-textSecondary">
            {leaveTypes.filter((type) => parseInt(type.value) === leave.leaveType)[0]?.label ||
              "Unknown"}{" "}
            - {moment(leave.leaveDate).format("YYYY-DD-MM")}
            {leave.halfDay && `- Half day ${leave.halfDay}`}
            {leaveTypes.find((type) => parseInt(type.value) === leave.leaveType)?.isLieuLeave &&
              leave.coveringDate && (
                <div className="ml-4 text-xs text-textSecondary">
                  Covering Date: {moment(leave.coveringDate).format("YYYY-DD-MM")}
                </div>
              )}
          </div>
        ))}
      </div>
      {leaveRequest?.documents?.length && leaveRequest?.documents?.length > 0 ? (
        <div className="flex flex-col gap-3">
          <h2 className="flex items-center gap-2">
            <Paperclip size={12} /> Supporting Documents
          </h2>
          {leaveRequest?.documents.map((doc) => (
            <>
              <div
                key={doc.fileUrl}
                className="flex items-center justify-between rounded-xl border bg-gray-50 p-4"
              >
                <div className="flex items-center gap-3">
                  <a
                    href={doc.fileUrl}
                    download
                    target="_blank"
                    rel="noopener noreferrer"
                    className="break-all text-blue-600 hover:underline"
                  >
                    {doc.createdAt}
                  </a>
                </div>
              </div>
            </>
          ))}
        </div>
      ) : (
        <></>
      )}

      {approval.status === "PENDING" && (
        <div className="flex w-full gap-3">
          <Button
            onClick={() =>
              handleApproval({
                itemId: leaveRequest?.id as number,
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
            onClick={() => handleConfirmation(leaveRequest?.id as number)}
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
