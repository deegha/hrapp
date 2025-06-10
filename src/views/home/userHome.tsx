import {PageLayout} from "@/components";
import {useCallback, useEffect, useState} from "react";
import {fetchLeave, fetchLeaveBalance, fetchUpcomingCompanyLeaves} from "@/services/leaveService";
import {approvalService} from "@/services/approvalService";
import {fetchMyPermissions} from "@/services/userService";
import {useRouter} from "next/router";
import {LeaveRequest, LeaveRequestWithUser, TApproval} from "@/types";
import {format} from "date-fns";

type LeaveBalance = {
  yearlyAllowance: number;
  usedDays: number;
  remainingDays: number;
};

export function UserHome() {
  const [upcomingLeaves, setUpcomingLeaves] = useState<LeaveRequest[]>([]);
  const [leaveBalance, setLeaveBalance] = useState<LeaveBalance | null>(null);
  const [pendingApprovals, setPendingApprovals] = useState<TApproval[]>([]);
  const [companyLeaves, setCompanyLeaves] = useState<LeaveRequestWithUser[]>([]);
  const [userPermission, setUserPermission] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Proper admin check based on user permission
  const isAdmin = userPermission === "ADMIN_USER" || userPermission === "SUPER_USER";

  const loadDashboardData = useCallback(async () => {
    try {
      // Load user permissions first
      const permissionResponse = await fetchMyPermissions();
      setUserPermission(permissionResponse.data.permission);

      // Load upcoming leaves
      const leavesResponse = await fetchLeave({page: 1, limit: 10});
      const upcoming = leavesResponse.data.data.filter((leave) =>
        leave.leaves.some((l) => new Date(l.leaveDate) > new Date()),
      );
      setUpcomingLeaves(upcoming);

      // Load leave balance
      const balanceResponse = await fetchLeaveBalance();
      setLeaveBalance(balanceResponse.data);

      // Load admin-specific data if user is admin
      const isUserAdmin =
        permissionResponse.data.permission === "ADMIN_USER" ||
        permissionResponse.data.permission === "SUPER_USER";

      if (isUserAdmin) {
        try {
          const approvalsResponse = await approvalService({page: 1, limit: 5});
          setPendingApprovals(approvalsResponse.data.data);

          const companyLeavesResponse = await fetchUpcomingCompanyLeaves();
          setCompanyLeaves(companyLeavesResponse.data);
        } catch (adminError) {
          console.error("Error loading admin data:", adminError);
        }
      }
    } catch (error) {
      console.error("Error loading dashboard data:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  if (loading)
    return (
      <PageLayout pageName="Home">
        <div className="flex items-center justify-center py-8">
          <div className="text-sm text-textSecondary">Loading dashboard...</div>
        </div>
      </PageLayout>
    );

  return (
    <PageLayout pageName="Home">
      <div className="mx-auto max-w-4xl">
        <div className="mb-6">
          {isAdmin ? (
            <p className="max-w-[250px] text-sm text-textSecondary">
              Get a complete overview of your leave balance, upcoming time off, pending approvals,
              and <br />
              team leave schedule—all in one place. Stay informed and manage your time off
              effortlessly
            </p>
          ) : (
            <p className="max-w-[250px] text-sm text-textSecondary">
              Get a complete overview of your leave balance, upcoming time off and <br /> Your
              profile information. Stay informed and manage your time off effortlessly
            </p>
          )}
        </div>

        <div className="space-y-6">
          {/* Leave Balance Section */}
          <div className="rounded-lg border border-border bg-white p-6 shadow-sm">
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-textSecondary">
              My Leave Balance
            </h3>
            <div className="flex items-center justify-between">
              <div>
                <p className="mb-2 text-lg font-semibold text-textPrimary">
                  Leave Balance Overview
                </p>
                <div className="flex gap-4 text-sm">
                  {leaveBalance ? (
                    <>
                      <div className="flex flex-col">
                        <span className="text-xs text-textSecondary">Total</span>
                        <span className="font-semibold text-textPrimary">
                          {leaveBalance.yearlyAllowance}
                        </span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs text-textSecondary">Used</span>
                        <span className="font-semibold text-red-600">{leaveBalance.usedDays}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs text-textSecondary">Remaining</span>
                        <span className="font-semibold text-green-600">
                          {leaveBalance.remainingDays}
                        </span>
                      </div>
                    </>
                  ) : (
                    <span className="text-textSecondary">Loading...</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* My Upcoming Leaves Section */}
          <div className="rounded-lg border border-border bg-white p-6 shadow-sm">
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-textSecondary">
              My Upcoming Leaves
            </h3>
            {upcomingLeaves.length > 0 ? (
              <div className="flex flex-col gap-3">
                {upcomingLeaves.slice(0, 5).map((leave) => {
                  const sortedLeaves = [...leave.leaves].sort(
                    (a, b) => new Date(a.leaveDate).getTime() - new Date(b.leaveDate).getTime(),
                  );
                  const fromDate = sortedLeaves[0]?.leaveDate;
                  const toDate = sortedLeaves[sortedLeaves.length - 1]?.leaveDate;
                  const firstLeave = sortedLeaves[0];

                  // Skip if no valid dates
                  if (
                    !fromDate ||
                    !toDate ||
                    isNaN(new Date(fromDate).getTime()) ||
                    isNaN(new Date(toDate).getTime())
                  )
                    return null;

                  return (
                    <div
                      key={leave.id}
                      className="flex items-center justify-between rounded-md border border-gray-100 p-4"
                    >
                      <div className="flex-1">
                        <p className="mb-1 font-medium text-textPrimary">
                          {format(new Date(fromDate), "dd MMM yyyy")} —{" "}
                          {format(new Date(toDate), "dd MMM yyyy")}
                        </p>
                        <div className="text-xs text-textSecondary">
                          {firstLeave?.halfDay
                            ? `Half Day (${firstLeave?.halfDay === "AM" ? "Morning" : "Evening"})`
                            : "Full Days"}
                        </div>
                      </div>
                      <div>
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${
                            firstLeave?.LeaveStatus?.statusLabel === "APPROVED"
                              ? "border border-green-200 bg-green-100 text-green-800"
                              : firstLeave?.LeaveStatus?.statusLabel === "PENDING"
                                ? "border border-amber-200 bg-amber-100 text-amber-800"
                                : "border border-red-200 bg-red-100 text-red-800"
                          }`}
                        >
                          {firstLeave?.LeaveStatus?.statusLabel === "APPROVED"
                            ? "✓ APPROVED"
                            : firstLeave?.LeaveStatus?.statusLabel === "PENDING"
                              ? "⏳ PENDING"
                              : firstLeave?.LeaveStatus?.statusLabel}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="rounded-md bg-gray-50 p-4 text-center text-sm text-textSecondary">
                No upcoming leaves scheduled
              </div>
            )}
          </div>

          {/* Admin Section */}
          {isAdmin && (
            <>
              {/* Pending Approvals Section */}
              <div className="rounded-lg border border-border bg-white p-6 shadow-sm">
                <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-textSecondary">
                  Pending Approvals
                </h3>
                <div
                  onClick={() => router.push("/approvals")}
                  className="flex cursor-pointer items-center justify-between rounded-md border border-gray-100 p-4 transition-colors hover:bg-gray-50"
                >
                  <div className="flex-1">
                    <p className="mb-1 font-medium text-textPrimary">
                      Approval Requests ({pendingApprovals.length})
                    </p>
                    <div className="text-xs text-textSecondary">
                      {pendingApprovals.length > 0
                        ? `${pendingApprovals.length} requests need your attention`
                        : "No pending approvals"}
                    </div>
                  </div>
                  <div>
                    <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700">
                      {pendingApprovals.length}
                    </span>
                  </div>
                </div>
              </div>

              {/* All Company Leave Requests for Upcoming Week */}
              <div className="rounded-lg border border-border bg-white p-6 shadow-sm">
                <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-textSecondary">
                  All Company Leave Requests (Next 7 Days)
                </h3>
                {companyLeaves.length > 0 ? (
                  <div className="space-y-3">
                    {companyLeaves.map((leave) => {
                      const sortedLeaves = [...leave.leaves].sort(
                        (a, b) => new Date(a.leaveDate).getTime() - new Date(b.leaveDate).getTime(),
                      );
                      const fromDate = sortedLeaves[0]?.leaveDate;
                      const toDate = sortedLeaves[sortedLeaves.length - 1]?.leaveDate;
                      const firstLeave = sortedLeaves[0];

                      // Skip if no valid dates
                      if (
                        !fromDate ||
                        !toDate ||
                        isNaN(new Date(fromDate).getTime()) ||
                        isNaN(new Date(toDate).getTime())
                      )
                        return null;

                      return (
                        <div
                          key={leave.id}
                          className="flex items-center justify-between rounded-md border border-gray-100 p-4"
                        >
                          <div className="flex-1">
                            <p className="mb-1 font-medium text-textPrimary">
                              {leave.user?.firstName} {leave.user?.lastName}
                            </p>
                            <p className="mb-1 text-sm text-textSecondary">
                              {format(new Date(fromDate), "dd MMM yyyy")} —{" "}
                              {format(new Date(toDate), "dd MMM yyyy")}
                            </p>
                            <div className="text-xs text-textSecondary">
                              {firstLeave?.halfDay
                                ? `Half Day (${firstLeave?.halfDay === "AM" ? "Morning" : "Evening"})`
                                : "Full Days"}
                            </div>
                          </div>
                          <div>
                            <span
                              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                                firstLeave?.LeaveStatus?.statusLabel === "APPROVED"
                                  ? "border border-green-200 bg-green-100 text-green-800"
                                  : firstLeave?.LeaveStatus?.statusLabel === "PENDING"
                                    ? "border border-amber-200 bg-amber-100 text-amber-800"
                                    : "border border-red-200 bg-red-100 text-red-800"
                              }`}
                            >
                              {firstLeave?.LeaveStatus?.statusLabel === "APPROVED"
                                ? "✓ APPROVED"
                                : firstLeave?.LeaveStatus?.statusLabel === "PENDING"
                                  ? "⏳ PENDING"
                                  : firstLeave?.LeaveStatus?.statusLabel}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="rounded-md bg-gray-50 p-4 text-center text-sm text-textSecondary">
                    No upcoming company leaves
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </PageLayout>
  );
}
