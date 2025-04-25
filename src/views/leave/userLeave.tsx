import { PageLayout, Button, Card, CardContent } from "@/components";
import { useRouter } from "next/navigation";
import useSWR from "swr";
import { fetchLeave } from "@/services/";
import { format } from "date-fns";
import Link from "next/link";
import { leaveTypes, statusColors } from "@/utils/staticValues";

export function UserLeave() {
  const router = useRouter();
  const { data } = useSWR("fetchLeave", fetchLeave);

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
          const statusLabel = firstLeave?.LeaveStatus?.statusLabel;
          const statusColor =
            statusColors[statusLabel as string] || "text-gray-500";

          return (
            <Link href={`/leave-management/${request.id}`} key={request.id}>
              <Card className="w-full">
                <CardContent className="flex justify-between">
                  <div className="flex flex-col gap-1">
                    <div className="text-sm font-medium text-textPrimary">
                      From: {format(new Date(fromDate), "dd MMM yyyy")} — To:{" "}
                      {format(new Date(toDate), "dd MMM yyyy")}
                    </div>
                    <div className="text-xs text-textPrimary">
                      Type:{" "}
                      {leaveTypes[firstLeave?.leaveType].label || "Unknown"}
                    </div>
                    <div className="text-xs text-textSecondary">
                      {firstLeave?.halfDay
                        ? `First Day: Half Day (${firstLeave?.halfDay === "AM" ? "Morning" : "Evening"})`
                        : "Full Days"}
                    </div>

                    {request.documents?.length > 0 && (
                      <div className="mt-1">
                        <ul className="text-xs text-blue-600 underline">
                          {request.documents.map((doc) => (
                            <li key={doc.id}>Document {doc.id}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                  <div>
                    {statusLabel && (
                      <div className={`text-xs font-semibold ${statusColor}`}>
                        {statusLabel}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </PageLayout>
  );
}
