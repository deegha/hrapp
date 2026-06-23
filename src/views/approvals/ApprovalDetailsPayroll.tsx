import {useApprovalStore} from "@/store/approvalStore";
import Link from "next/link";

export function ApprovalDetailsPayroll() {
  const {approval} = useApprovalStore();
  const data = approval.data as
    | {period?: string; startDate?: string; endDate?: string; totalAmount?: number}
    | undefined;

  return (
    <div className="flex flex-col gap-6 p-4">
      <div>
        <h2 className="text-lg font-semibold">Payroll Approval</h2>
        <p className="text-sm text-gray-500">{approval.title}</p>
      </div>

      <div className="flex flex-col gap-3 rounded-lg border border-border p-4">
        {data?.period && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Period</span>
            <span className="font-medium">{data.period}</span>
          </div>
        )}
        {data?.startDate && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Start Date</span>
            <span className="font-medium">{data.startDate}</span>
          </div>
        )}
        {data?.endDate && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">End Date</span>
            <span className="font-medium">{data.endDate}</span>
          </div>
        )}
        {data?.totalAmount !== undefined && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Total Amount</span>
            <span className="font-semibold">
              {data.totalAmount.toLocaleString("en-US", {style: "currency", currency: "USD"})}
            </span>
          </div>
        )}
      </div>

      <p className="text-sm text-gray-500">
        To review the full payroll details and approve or reject, open the payroll page.
      </p>

      <Link
        href={`/payroll/${approval.targetId}`}
        className="hover:bg-primary/90 inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-white"
      >
        View Payroll
      </Link>
    </div>
  );
}
