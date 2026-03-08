import useSWR from "swr";
import {fetchUserLeaveBalance} from "@/services/leaveService";

interface UserLeaveBalanceProps {
  employeeId: number;
}

export function UserLeaveBalance({employeeId}: UserLeaveBalanceProps) {
  const {data, isLoading} = useSWR(employeeId ? `leave-balance-${employeeId}` : null, () =>
    fetchUserLeaveBalance(employeeId),
  );

  const balance = data?.data;

  return (
    <div className="flex flex-col gap-3">
      <h2>Leave Balance</h2>
      {isLoading && <p className="text-sm text-textSecondary">Loading...</p>}
      {!isLoading && !balance && (
        <p className="text-sm text-textSecondary">No leave balance data available</p>
      )}
      {balance && (
        <>
          {balance.leaveTypeBalances.map((type) => (
            <div
              key={type.id}
              className="flex items-center justify-between rounded-md border border-gray-200 px-4 py-3"
            >
              <span className="text-sm font-medium">{type.name}</span>
              <div className="flex items-center gap-4 text-sm">
                <span className="text-textSecondary">
                  {type.usedDays} / {type.yearlyAllowance} used
                </span>
                <span
                  className={`font-semibold ${type.remainingDays < 0 ? "text-red-500" : "text-green-600"}`}
                >
                  {type.remainingDays} remaining
                </span>
              </div>
            </div>
          ))}
          <div className="flex items-center justify-between rounded-md bg-gray-50 px-4 py-3">
            <span className="text-sm font-semibold">Total</span>
            <div className="flex items-center gap-4 text-sm">
              <span className="text-textSecondary">
                {balance.usedDays} / {balance.yearlyAllowance} used
              </span>
              <span
                className={`font-semibold ${balance.remainingDays < 0 ? "text-red-500" : "text-green-600"}`}
              >
                {balance.remainingDays} remaining
              </span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
