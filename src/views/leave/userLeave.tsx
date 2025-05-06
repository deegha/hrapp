import {
  PageLayout,
  Button,
  Pagination,
  ItemsList,
  Drawer,
  NoDataFound,
} from "@/components";
import { useRouter } from "next/navigation";
import useSWR from "swr";
import { fetchLeave } from "@/services/";
import { format } from "date-fns";

import { leaveTypes } from "@/utils/staticValues";
import { usePagination } from "@/hooks/usePagination";
import moment from "moment";
import { useLeaveRequestStore } from "@/store/leaveStore";
import { LeaveRequest } from "@/types";

export function UserLeave() {
  const { setActiveLeaveRequest, leaveRequest, unsetActiveLeaveRequest } =
    useLeaveRequestStore();
  const { activePage } = usePagination();
  const router = useRouter();
  const { data } = useSWR(
    `fetch-leaves-${activePage}`,
    async () => await fetchLeave({ page: parseInt(activePage), limit: 6 })
  );

  function handleApplyLeave() {
    router.push("./leave-management/apply");
  }

  function handleActiveLeave(leaveRequest: LeaveRequest) {
    setActiveLeaveRequest(leaveRequest);
  }

  if (!data) {
    return <NoDataFound pageName="Leave Management" />;
  }

  return (
    <PageLayout
      pageName="Leave Management"
      actionButton={
        <Button onClick={handleApplyLeave}>REQUEST TIME OUT</Button>
      }
    >
      <Drawer
        open={leaveRequest.id ? true : false}
        close={unsetActiveLeaveRequest}
      >
        <div></div>
      </Drawer>
      <div className="flex flex-col gap-5">
        <div className="flex flex-col ">
          {data?.data.data.map((request) => {
            const sortedLeaves = [...request.leaves].sort(
              (a, b) =>
                new Date(a.leaveDate).getTime() -
                new Date(b.leaveDate).getTime()
            );

            const fromDate = sortedLeaves[0]?.leaveDate;
            const toDate = sortedLeaves[sortedLeaves.length - 1]?.leaveDate;
            const firstLeave = sortedLeaves[0];

            return (
              <ItemsList
                status={firstLeave?.LeaveStatus?.statusLabel}
                onClick={() => handleActiveLeave(request)}
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
        </div>

        {data?.data?.totalPages > 1 && (
          <Pagination numberOfPage={data?.data.totalPages as number} />
        )}
      </div>
    </PageLayout>
  );
}
