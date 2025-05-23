"use client";

import useSWR from "swr";
import { fetchLeaveRequest } from "@/services";
import { format } from "date-fns";
import { Button, StatusTag } from "@/components";
import { leaveTypes } from "@/utils/staticValues";
import LeaveDetailsSkeleton from "@/utils/skeletons/LeaveDetailsSkeleton";

export function LeaveRequestDetails({
  leaveRequestId,
}: {
  leaveRequestId: number;
}) {
  const id = leaveRequestId;
  const { data, isLoading } = useSWR(id ? `leaveRequest-${id}` : null, () =>
    fetchLeaveRequest(id.toString())
  );

  if (!data || isLoading) return <LeaveDetailsSkeleton />;

  const request = data?.data;
  const sortedLeaves = [...request.leaves].sort(
    (a, b) => new Date(a.leaveDate).getTime() - new Date(b.leaveDate).getTime()
  );

  const fromDate = sortedLeaves[0]?.leaveDate;
  const toDate = sortedLeaves[sortedLeaves.length - 1]?.leaveDate;
  const statusLabel = sortedLeaves[0]?.LeaveStatus?.statusLabel;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-[32px] font-semibold uppercase">
          Leave Request Details
        </h1>
        <StatusTag status={statusLabel} />
      </div>
      <div>
        <div className="text-sm font-medium text-textPrimary">
          From: {format(new Date(fromDate), "dd MMM yyyy")} — To:{" "}
          {format(new Date(toDate), "dd MMM yyyy")}
        </div>

        {request.note && (
          <div className="text-sm text-textSecondary mt-1">
            Note: {request.note}
          </div>
        )}
      </div>
      <div className="flex flex-col gap-3">
        <h2> Leave Days</h2>
        <ul className="text-sm text-textSecondary list-disc ml-4">
          {sortedLeaves.map((leave) => (
            <li key={leave.id}>
              {format(new Date(leave.leaveDate), "dd MMM yyyy")} -{" "}
              {leaveTypes[leave.leaveType].label || "Unknown"}{" "}
              {leave.halfDay &&
                `(Half Day: ${leave.halfDay === "AM" ? "Morning" : "Evening"})`}
            </li>
          ))}
        </ul>
      </div>
      {request.documents?.length > 0 && (
        <div className="flex flex-col gap-3">
          <h2>Documents</h2>
          <div className="grid grid-cols-2 gap-4">
            {request.documents.map((doc) => {
              const isPDF = doc.fileUrl.toLowerCase().endsWith(".pdf");
              return (
                <div
                  key={doc.id}
                  className="border border-border rounded-md p-2"
                >
                  {isPDF ? (
                    <iframe
                      src={doc.fileUrl}
                      className="w-full h-[400px]"
                      title={`Document ${doc.id}`}
                    />
                  ) : (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={doc.fileUrl}
                      alt={`Document ${doc.id}`}
                      className="w-full h-48 object-contain"
                    />
                  )}
                  <a
                    href={doc.fileUrl}
                    download
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 text-xs underline block mt-2"
                  >
                    Download
                  </a>
                </div>
              );
            })}
          </div>
        </div>
      )}
      <hr className="border-t border-border" />
      <div className="flex justify-end gap-2  w-full">
        <Button onClick={() => console.log("Edit leave")} variant="secondary">
          Edit
        </Button>
        <Button variant="danger" onClick={() => console.log("Delete leave")}>
          Delete
        </Button>
      </div>
    </div>
  );
}
