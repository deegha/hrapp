import { useApprovalStore } from "@/store/approvalStore";
import { fetchLeaveRequest } from "@/services";
import useSWR from "swr";
import { Button, StatusTag } from "@/components";
import moment from "moment";
import { leaveTypes } from "@/utils/staticValues";
import { Check, Trash, Paperclip } from "react-feather";

import { useApproval } from "./useApprove";
export function ApprovalDetails() {
  const { approval } = useApprovalStore();

  const { handleApproval, loading, handleConfirmation } = useApproval();

  const { data, isLoading } = useSWR(
    `fetch-leave-${approval.id}`,
    async () => await fetchLeaveRequest(approval.targetId.toString())
  );

  if (!data) <div>No data found</div>;

  const leaveRequest = data?.data;

  return (
    <div className="flex flex-col gap-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[32px] font-semibold uppercase">
            {approval?.title}
          </h1>
          <p className="text-xxs text-textSecondary">
            Created on{" "}
            {moment(leaveRequest?.createdAt).format("yyyy-DD-mm : HH:mm")}
          </p>
        </div>
        <StatusTag status={approval.status} />
      </div>

      {isLoading &&
        Array.from({ length: 3 }).map((_, idx) => (
          <div
            key={idx}
            className="h-5 w-32 bg-gray-200 rounded animate-pulse"
          ></div>
        ))}

      <div className="flex flex-col gap-3">
        <h2>Leave dates</h2>
        {leaveRequest?.leaves?.map((leave) => (
          <div key={leave.leaveDate} className="text-sm text-textSecondary">
            {
              leaveTypes.filter(
                (type) => parseInt(type.value) === leave.leaveType
              )[0].label
            }{" "}
            - {moment(leave.leaveDate).format("YYYY-DD-MM")}
            {leave.halfDay && `- Half day ${leave.halfDay}`}
          </div>
        ))}
      </div>
      {leaveRequest?.documents?.length &&
      leaveRequest?.documents?.length > 0 ? (
        <div className="flex flex-col gap-3">
          <h2 className="flex items-center gap-2">
            <Paperclip size={12} /> Supporting Documents
          </h2>
          {leaveRequest?.documents.map((doc) => (
            <>
              <div
                key={doc.fileUrl}
                className="flex items-center justify-between bg-gray-50 rounded-xl p-4 border"
              >
                <div className="flex items-center gap-3">
                  <a
                    href={doc.fileUrl}
                    download
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline break-all"
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
        <div className="flex gap-3  w-full">
          <Button
            onClick={() =>
              handleApproval({
                itemId: leaveRequest?.id as number,
                action: "APPROVED",
              })
            }
            loading={loading === "APPROVED" ? true : false}
          >
            <div className="flex gap-1 items-center">
              <Check size={14} /> Approve
            </div>
          </Button>

          <Button
            loading={loading === "REJECTED" ? true : false}
            variant="danger"
            onClick={() => handleConfirmation(leaveRequest?.id as number)}
          >
            <div className="flex gap-1 items-center">
              <Trash size={14} />
              Reject
            </div>
          </Button>
        </div>
      )}
    </div>
  );
}
