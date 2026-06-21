import {Layout, PageLayout, Button, Shimmer} from "@/components";
import useSWR, {mutate} from "swr";
import {useRouter} from "next/router";
import {fetchPayroll, approvePayroll, updatePayrollEntry} from "@/services/payrollService";
import {TPayrollEntry} from "@/types/payroll";
import {useState} from "react";
import {Edit2, Check, X, ArrowLeft} from "react-feather";
import Link from "next/link";
import {useNotificationStore} from "@/store/notificationStore";
import {PayrollReportsSection} from "@/components/payroll/PayrollReportsSection";

const fmt = (n: number) => `LKR ${new Intl.NumberFormat("en-US").format(n)}`;

const statusColors: Record<string, string> = {
  PROCESSING: "bg-yellow-100 text-yellow-700",
  READY_FOR_REVIEW: "bg-blue-100 text-blue-700",
  APPROVED: "bg-green-100 text-green-700",
};
const statusLabels: Record<string, string> = {
  PROCESSING: "Processing",
  READY_FOR_REVIEW: "Ready for Review",
  APPROVED: "Approved",
};

function EntryRow({
  entry,
  canEdit,
  onSave,
}: {
  entry: TPayrollEntry;
  canEdit: boolean;
  onSave: (entryId: number, adjustedGross: number, note: string) => Promise<void>;
}) {
  const [editing, setEditing] = useState(false);
  const [gross, setGross] = useState(String(entry.adjustedGross));
  const [note, setNote] = useState(entry.note ?? "");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await onSave(entry.id, Number(gross), note);
    setSaving(false);
    setEditing(false);
  };

  return (
    <div className="border-t border-border py-4">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-semibold text-textPrimary">
            {entry.user
              ? `${entry.user.firstName} ${entry.user.lastName}`
              : `User #${entry.userId}`}
          </p>
          {entry.user?.employeeId && (
            <p className="text-xs text-textSecondary">EMP-{entry.user.employeeId}</p>
          )}
        </div>
        {canEdit && !editing && (
          <button
            onClick={() => setEditing(true)}
            className="text-textSecondary hover:text-primary"
          >
            <Edit2 size={14} />
          </button>
        )}
        {editing && (
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              disabled={saving}
              className="text-green-600 hover:text-green-700"
            >
              <Check size={16} />
            </button>
            <button onClick={() => setEditing(false)} className="text-red-500 hover:text-red-600">
              <X size={16} />
            </button>
          </div>
        )}
      </div>

      <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 sm:grid-cols-3 lg:grid-cols-4">
        <Stat label="Gross Salary" value={fmt(entry.grossSalary)} />
        <Stat
          label="Adjusted Gross"
          value={
            editing ? (
              <input
                type="number"
                value={gross}
                onChange={(e) => setGross(e.target.value)}
                className="w-full rounded border border-border px-2 py-0.5 font-mono text-xs focus:outline-none focus:ring-1 focus:ring-primary"
              />
            ) : (
              fmt(entry.adjustedGross)
            )
          }
        />
        <Stat label="Working Days" value={`${entry.paidDays} / ${entry.workingDays}`} />
        <Stat label="Leave Days" value={String(entry.leaveDays)} />
        {!entry.isFlatSalary && (
          <>
            <Stat label="EPF (Employee 8%)" value={`− ${fmt(entry.epfEmployee)}`} />
            <Stat label="PAYE Tax" value={`− ${fmt(entry.monthlyTax)}`} />
          </>
        )}
        <Stat label="Net Salary" value={fmt(entry.netSalary)} bold />
        {!entry.isFlatSalary && (
          <>
            <Stat label="EPF (Employer 12%)" value={`+ ${fmt(entry.epfEmployer)}`} />
            <Stat label="ETF (3%)" value={`+ ${fmt(entry.etfEmployer)}`} />
            <Stat label="Total Cost" value={fmt(entry.totalCost)} bold />
          </>
        )}
        {entry.isFlatSalary && (
          <span className="bg-primary/10 self-center rounded-full px-2 py-0.5 text-xs text-primary">
            Flat Salary
          </span>
        )}
      </div>

      {editing && (
        <div className="mt-2">
          <label className="mb-1 block text-xs text-textSecondary">Note</label>
          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Optional note..."
            className="w-full rounded border border-border px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
      )}
      {!editing && entry.note && (
        <p className="mt-1 text-xs italic text-textSecondary">{entry.note}</p>
      )}
    </div>
  );
}

function Stat({label, value, bold}: {label: string; value: React.ReactNode; bold?: boolean}) {
  return (
    <div>
      <p className="text-xs text-textSecondary">{label}</p>
      <p
        className={`font-mono text-xs ${bold ? "font-semibold text-textPrimary" : "text-textPrimary"}`}
      >
        {value}
      </p>
    </div>
  );
}

export default function PayrollDetailPage() {
  const router = useRouter();
  const payrollId = Number(router.query.payrollId);
  const {showNotification} = useNotificationStore();

  const {data, isLoading} = useSWR(payrollId ? `payroll-${payrollId}` : null, () =>
    fetchPayroll(payrollId),
  );
  const payroll = data?.data;

  const [approving, setApproving] = useState(false);
  const [showApproveConfirm, setShowApproveConfirm] = useState(false);

  const handleApprove = async () => {
    setApproving(true);
    try {
      await approvePayroll(payrollId);
      await mutate(`payroll-${payrollId}`);
      await mutate("payrolls");
      setShowApproveConfirm(false);
      showNotification({type: "success", message: "Payroll approved successfully"});
    } catch {
      showNotification({type: "error", message: "Failed to approve payroll"});
    } finally {
      setApproving(false);
    }
  };

  const handleSaveEntry = async (entryId: number, adjustedGross: number, note: string) => {
    try {
      await updatePayrollEntry(entryId, {adjustedGross, note: note || undefined});
      await mutate(`payroll-${payrollId}`);
      showNotification({type: "success", message: "Entry updated"});
    } catch {
      showNotification({type: "error", message: "Failed to update entry"});
    }
  };

  const canEdit = payroll?.status === "READY_FOR_REVIEW";
  const canApprove = payroll?.status === "READY_FOR_REVIEW";

  return (
    <Layout>
      <PageLayout
        pageName={
          payroll
            ? `Payroll — ${new Date(payroll.periodStart).toLocaleDateString("en-US", {month: "long", year: "numeric"})}`
            : "Payroll"
        }
        actionButton={
          canApprove ? (
            <Button onClick={() => setShowApproveConfirm(true)}>Approve Payroll</Button>
          ) : undefined
        }
      >
        <div className="mb-4">
          <Link
            href="/payroll"
            className="flex items-center gap-1.5 text-sm text-textSecondary hover:text-primary"
          >
            <ArrowLeft size={14} /> Back to Payrolls
          </Link>
        </div>

        {isLoading || !payroll ? (
          <Shimmer />
        ) : (
          <>
            {/* Header summary */}
            <div className="mb-6 flex flex-wrap items-center gap-4 rounded-xl border border-border bg-white px-5 py-4 shadow-sm">
              <div>
                <p className="text-xs text-textSecondary">Period</p>
                <p className="text-sm font-semibold text-textPrimary">
                  {new Date(payroll.periodStart).toLocaleDateString()} –{" "}
                  {new Date(payroll.periodEnd).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-xs text-textSecondary">Total Net Payroll</p>
                <p className="font-mono text-sm font-semibold text-textPrimary">
                  {fmt(payroll.totalAmount)}
                </p>
              </div>
              <div>
                <p className="text-xs text-textSecondary">Employees</p>
                <p className="text-sm font-semibold text-textPrimary">{payroll.entries.length}</p>
              </div>
              <div>
                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusColors[payroll.status]}`}
                >
                  {statusLabels[payroll.status]}
                </span>
              </div>
            </div>

            {payroll.status === "PROCESSING" && (
              <div className="mb-4 rounded-lg bg-yellow-50 px-4 py-3 text-sm text-yellow-800">
                Payroll is being processed in the background. Refresh in a moment to see results.
              </div>
            )}

            {/* Entries */}
            <div className="rounded-xl border border-border bg-white px-5 shadow-sm">
              {payroll.entries.length === 0 ? (
                <p className="py-6 text-center text-sm text-textSecondary">
                  No entries yet. Payroll is still processing.
                </p>
              ) : (
                payroll.entries.map((entry) => (
                  <EntryRow
                    key={entry.id}
                    entry={entry}
                    canEdit={canEdit}
                    onSave={handleSaveEntry}
                  />
                ))
              )}
            </div>

            {/* Post-approval compliance documents */}
            {payroll.status === "APPROVED" && <PayrollReportsSection payroll={payroll} />}
          </>
        )}

        {/* Approve confirmation modal */}
        {showApproveConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
              <h2 className="mb-2 text-base font-semibold text-textPrimary">Approve Payroll?</h2>
              <p className="mb-5 text-sm text-textSecondary">
                This will finalize the payroll for{" "}
                {payroll &&
                  new Date(payroll.periodStart).toLocaleDateString("en-US", {
                    month: "long",
                    year: "numeric",
                  })}
                . Total:{" "}
                <span className="font-semibold">{payroll && fmt(payroll.totalAmount)}</span>
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowApproveConfirm(false)}
                  className="rounded-lg px-4 py-2 text-sm text-textSecondary hover:bg-background"
                >
                  Cancel
                </button>
                <Button onClick={handleApprove} disabled={approving}>
                  {approving ? "Approving..." : "Approve"}
                </Button>
              </div>
            </div>
          </div>
        )}
      </PageLayout>
    </Layout>
  );
}
