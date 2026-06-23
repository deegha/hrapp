import {useApprovalStore} from "@/store/approvalStore";
import {StatusTag, Detail} from "@/components";
import moment from "moment";
import Link from "next/link";
import {ExternalLink} from "react-feather";

const fmt = (n: number) => `LKR ${new Intl.NumberFormat("en-US").format(n)}`;

export function ApprovalDetailsPayroll() {
  const {approval} = useApprovalStore();

  const data = approval?.data as
    | {payrollId: number; periodStart: string; periodEnd: string; totalAmount: number}
    | undefined;

  const periodLabel = data?.periodStart
    ? new Date(data.periodStart).toLocaleDateString("en-US", {month: "long", year: "numeric"})
    : "—";

  return (
    <div className="flex flex-col gap-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[32px] font-semibold uppercase">{approval?.title}</h1>
          <p className="text-xxs text-textSecondary">
            Created on {moment(approval?.createdAt).format("YYYY-DD-MM : HH:mm")}
          </p>
        </div>
        <StatusTag status={approval.status} />
      </div>

      <div className="flex flex-col gap-3">
        <h2>Payroll Details</h2>
        <Detail label="Period" value={periodLabel} />
        {data?.periodStart && (
          <Detail
            label="Date Range"
            value={`${new Date(data.periodStart).toLocaleDateString()} – ${new Date(data.periodEnd).toLocaleDateString()}`}
          />
        )}
        {data?.totalAmount != null && <Detail label="Total Amount" value={fmt(data.totalAmount)} />}
      </div>

      <Link
        href={`/payroll/${approval.targetId}`}
        className="inline-flex items-center gap-2 rounded-xl border border-border bg-white px-4 py-3 text-sm font-medium text-textPrimary shadow-sm transition hover:shadow-md"
      >
        <ExternalLink size={15} />
        Open Payroll — {periodLabel}
      </Link>

      {approval.status === "PENDING" && (
        <p className="rounded-lg bg-blue-50 p-3 text-sm text-blue-700">
          To approve or reject this payroll, open the payroll page above and use the Approve button
          there.
        </p>
      )}
    </div>
  );
}
