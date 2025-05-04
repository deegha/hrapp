import { PageLayout, Button, Pagination, ItemsList } from "@/components";
import { useRouter } from "next/navigation";
import useSWR from "swr";
import { fetchLeave } from "@/services/";
import { format } from "date-fns";

import { leaveTypes } from "@/utils/staticValues";
import { usePagination } from "@/hooks/usePagination";
import moment from "moment";

export function UserLeave() {
  const { activePage } = usePagination();
  const router = useRouter();
  const { data } = useSWR(
    `fetch-leaves-${activePage}`,
    async () => await fetchLeave({ page: parseInt(activePage), limit: 6 })
  );

  function handleApplyLeave() {
    router.push("./leave-management/apply");
  }

  return (
    <PageLayout
      pageName="Leave Management"
      actionButton={
        <Button onClick={handleApplyLeave}>REQUEST TIME OUT</Button>
      }
    >
      <div className="flex flex-col gap-2">
        {data?.data.data.map((request) => {
          const sortedLeaves = [...request.leaves].sort(
            (a, b) =>
              new Date(a.leaveDate).getTime() - new Date(b.leaveDate).getTime()
          );

          const fromDate = sortedLeaves[0]?.leaveDate;
          const toDate = sortedLeaves[sortedLeaves.length - 1]?.leaveDate;
          const firstLeave = sortedLeaves[0];

          return (
            <ItemsList
              status={firstLeave?.LeaveStatus?.statusLabel}
              onClick={() => console.log("d")}
              key={request.id}
              title={`Leave From: ${format(new Date(fromDate), "dd MMM yyyy")} — To : 
                       ${format(new Date(toDate), "dd MMM yyyy")}`}
              content={
                <div>
                  <div className="text-xs text-textPrimary">
                    Type:{" "}
                    {leaveTypes.filter(
                      (type) => parseInt(type.value) === firstLeave.leaveType
                    )[0].label || "Unknown"}
                  </div>
                  <div className="text-xs text-textSecondary">
                    {firstLeave?.halfDay
                      ? `First Day: Half Day (${firstLeave?.halfDay === "AM" ? "Morning" : "Evening"})`
                      : "Full Days"}
                  </div>
                  <div>
                    Applied on{" "}
                    {moment(request.createdAt).format("yyyy-Do-MM : hh:mm a")}
                  </div>
                </div>
              }
            />
          );
        })}
        <Pagination numberOfPage={data?.data.totalPages as number} />
      </div>
    </PageLayout>
  );
}
