import { PageLayout, Button, Card, CardContent } from "@/components";
import { useRouter } from "next/navigation";
import useSWR from "swr";
import { fetchLeave } from "@/services/";
import { format } from "date-fns";
import Link from "next/link";

const leaveTypeLabels: Record<number, string> = {
  1: "Annual",
  2: "Casual",
  3: "Medical",
  4: "Special",
};

const statusColors: Record<string, string> = {
  PENDING: "text-secondary",
  APPROVED: "text-primary",
  REJECTED: "text-danger",
  CANCELLED: "text-gray",
};

export function UserLeave() {
  const router = useRouter();

  const { data } = useSWR("fetchLeave", fetchLeave);

  function handleApplyLeave() {
    router.push("./leave-management/apply");
  }

  const allLeaves = data?.data.flatMap((req) => req.leaves);

  return (
    <PageLayout
      pageName="Leave Management"
      actionButton={
        <Button onClick={handleApplyLeave}>Request time out</Button>
      }
    >
      <div className="flex flex-col gap-2">
        {allLeaves?.map((leave) => (
          <Link href={`/leave-management/${leave.id}`} key={leave.id}>
            <Card className="w-full">
              <CardContent className="flex items-start justify-between">
                <div>
                  <div className="text-sm font-medium text-textPrimary">
                    {format(new Date(leave.leaveDate), "dd MMM yyyy")}
                  </div>
                  <div className="text-xs text-textSecondary">
                    {leave.halfDay
                      ? `Half Day (${leave.halfDay === "AM" ? "Morning" : "Evening"})`
                      : "Full Day"}
                  </div>
                  <div className="text-xs text-textPrimary">
                    {leaveTypeLabels[leave.leaveType] || "Unknown"}
                  </div>
                </div>

                {leave.LeaveStatus && (
                  <div
                    className={`inline-block text-xs font-semibold rounded-md ${
                      statusColors[leave.LeaveStatus.statusLabel] ||
                      "bg-gray-200 text-gray-800"
                    }`}
                  >
                    {leave.LeaveStatus.statusLabel}
                  </div>
                )}
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </PageLayout>
  );
}
