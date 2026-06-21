import {Layout, PageLayout, Button, Shimmer, NoDataFoundComponent} from "@/components";
import useSWR, {mutate} from "swr";
import {
  fetchPayrolls,
  runPreflightCheck,
  runPayroll,
  deletePayroll,
} from "@/services/payrollService";
import {TPreflightResult, TPayrollSummary} from "@/types/payroll";
import Link from "next/link";
import {useState} from "react";
import {AlertTriangle, CheckCircle, Play, Trash2} from "react-feather";
import {useNotificationStore} from "@/store/notificationStore";

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

type Step = "idle" | "datePicker" | "preflight";

export default function PayrollPage() {
  const {showNotification} = useNotificationStore();
  const {data, isLoading} = useSWR("payrolls", fetchPayrolls);
  const payrolls = data?.data ?? [];

  const [step, setStep] = useState<Step>("idle");
  const [periodStart, setPeriodStart] = useState("");
  const [periodEnd, setPeriodEnd] = useState("");
  const [preflight, setPreflight] = useState<TPreflightResult | null>(null);
  const [checking, setChecking] = useState(false);
  const [running, setRunning] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);

  const openModal = () => {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, "0");
    setPeriodStart(`${y}-${m}-01`);
    const last = new Date(y, now.getMonth() + 1, 0);
    setPeriodEnd(`${y}-${m}-${String(last.getDate()).padStart(2, "0")}`);
    setPreflight(null);
    setStep("datePicker");
  };

  const handlePreflight = async () => {
    if (!periodStart || !periodEnd) return;
    setChecking(true);
    try {
      const res = await runPreflightCheck(periodStart, periodEnd);
      setPreflight(res.data);
      setStep("preflight");
    } catch {
      showNotification({type: "error", message: "Failed to run pre-flight check"});
    } finally {
      setChecking(false);
    }
  };

  const handleRunPayroll = async () => {
    setRunning(true);
    try {
      await runPayroll(periodStart, periodEnd);
      setStep("idle");
      await mutate("payrolls");
      showNotification({
        type: "success",
        message: "Payroll is processing. It will be ready for review shortly.",
      });
    } catch {
      showNotification({type: "error", message: "Failed to start payroll"});
    } finally {
      setRunning(false);
    }
  };

  const handleDelete = async (id: number) => {
    setDeletingId(id);
    try {
      await deletePayroll(id);
      await mutate("payrolls");
      showNotification({type: "success", message: "Payroll deleted"});
    } catch {
      showNotification({type: "error", message: "Failed to delete payroll"});
    } finally {
      setDeletingId(null);
      setConfirmDeleteId(null);
    }
  };

  return (
    <Layout>
      <PageLayout
        pageName="Payroll"
        actionButton={
          <Button onClick={openModal}>
            <Play size={14} className="mr-1.5" />
            Run Payroll
          </Button>
        }
      >
        {isLoading ? (
          <Shimmer />
        ) : payrolls.length === 0 ? (
          <div className="py-6">
            <NoDataFoundComponent />
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {payrolls.map((p: TPayrollSummary) => (
              <div key={p.id} className="flex items-center gap-2">
                <Link href={`/payroll/${p.id}`} className="flex-1">
                  <div className="flex cursor-pointer items-center justify-between rounded-xl border border-border bg-white px-5 py-4 shadow-sm transition hover:shadow-md">
                    <div>
                      <p className="text-sm font-semibold text-textPrimary">
                        {new Date(p.periodStart).toLocaleDateString("en-US", {
                          month: "long",
                          year: "numeric",
                        })}
                      </p>
                      <p className="mt-0.5 text-xs text-textSecondary">
                        {new Date(p.periodStart).toLocaleDateString()} –{" "}
                        {new Date(p.periodEnd).toLocaleDateString()} · {p._count.entries} employees
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <p className="font-mono text-sm font-semibold text-textPrimary">
                        {fmt(p.totalAmount)}
                      </p>
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusColors[p.status]}`}
                      >
                        {statusLabels[p.status]}
                      </span>
                    </div>
                  </div>
                </Link>
                {p.status !== "APPROVED" && (
                  <button
                    onClick={() => setConfirmDeleteId(p.id)}
                    disabled={deletingId === p.id}
                    className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-border bg-white text-textSecondary shadow-sm transition hover:border-red-300 hover:bg-red-50 hover:text-red-500"
                    title="Delete payroll"
                  >
                    <Trash2 size={15} />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Run Payroll modal */}
        {step !== "idle" && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
              {step === "datePicker" && (
                <>
                  <h2 className="mb-4 text-base font-semibold text-textPrimary">Run Payroll</h2>
                  <div className="flex flex-col gap-4">
                    <div>
                      <label className="mb-1 block text-xs font-medium text-textSecondary">
                        Period Start
                      </label>
                      <input
                        type="date"
                        value={periodStart}
                        onChange={(e) => setPeriodStart(e.target.value)}
                        className="w-full rounded-lg border border-border px-3 py-2 text-sm text-textPrimary focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-medium text-textSecondary">
                        Period End
                      </label>
                      <input
                        type="date"
                        value={periodEnd}
                        onChange={(e) => setPeriodEnd(e.target.value)}
                        className="w-full rounded-lg border border-border px-3 py-2 text-sm text-textPrimary focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                  </div>
                  <div className="mt-5 flex justify-end gap-3">
                    <button
                      onClick={() => setStep("idle")}
                      className="rounded-lg px-4 py-2 text-sm text-textSecondary hover:bg-background"
                    >
                      Cancel
                    </button>
                    <Button
                      onClick={handlePreflight}
                      disabled={checking || !periodStart || !periodEnd}
                    >
                      {checking ? "Checking..." : "Continue"}
                    </Button>
                  </div>
                </>
              )}

              {step === "preflight" && preflight && (
                <>
                  <h2 className="mb-4 text-base font-semibold text-textPrimary">
                    Pre-flight Check
                  </h2>
                  {preflight.canProceed ? (
                    <div className="flex items-center gap-2 rounded-lg bg-green-50 p-3 text-sm text-green-700">
                      <CheckCircle size={16} />
                      All checks passed. Ready to run payroll.
                    </div>
                  ) : (
                    <div className="flex flex-col gap-3">
                      <div className="flex items-start gap-2 rounded-lg bg-yellow-50 p-3 text-sm text-yellow-800">
                        <AlertTriangle size={16} className="mt-0.5 shrink-0" />
                        <p>Please resolve the following issues before running payroll.</p>
                      </div>

                      {preflight.unapprovedLeaves.length > 0 && (
                        <div>
                          <p className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-textSecondary">
                            Unapproved Leaves ({preflight.unapprovedLeaves.length})
                          </p>
                          {preflight.unapprovedLeaves.map((l) => (
                            <p key={l.user.id} className="text-sm text-textPrimary">
                              {l.user.firstName} {l.user.lastName} — {l.count} day
                              {l.count !== 1 ? "s" : ""}
                            </p>
                          ))}
                        </div>
                      )}

                      {preflight.missingBankDetails.length > 0 && (
                        <div className="mt-1">
                          <p className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-textSecondary">
                            Missing Bank Details ({preflight.missingBankDetails.length})
                          </p>
                          {preflight.missingBankDetails.map((u) => (
                            <p key={u.id} className="text-sm text-textPrimary">
                              {u.firstName} {u.lastName}
                            </p>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  <div className="mt-5 flex justify-end gap-3">
                    <button
                      onClick={() => setStep("datePicker")}
                      className="rounded-lg px-4 py-2 text-sm text-textSecondary hover:bg-background"
                    >
                      Back
                    </button>
                    {preflight.canProceed && (
                      <Button onClick={handleRunPayroll} disabled={running}>
                        {running ? "Starting..." : "Run Payroll"}
                      </Button>
                    )}
                    {!preflight.canProceed && (
                      <button
                        onClick={() => setStep("idle")}
                        className="rounded-lg bg-primary px-4 py-2 text-sm text-white"
                      >
                        Close
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* Delete confirmation modal */}
        {confirmDeleteId !== null && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
              <h2 className="mb-2 text-base font-semibold text-textPrimary">Delete Payroll?</h2>
              <p className="mb-5 text-sm text-textSecondary">
                This will permanently delete this payroll and all its entries. This cannot be
                undone.
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setConfirmDeleteId(null)}
                  className="rounded-lg px-4 py-2 text-sm text-textSecondary hover:bg-background"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(confirmDeleteId)}
                  disabled={deletingId === confirmDeleteId}
                  className="rounded-lg bg-red-500 px-4 py-2 text-sm text-white hover:bg-red-600 disabled:opacity-60"
                >
                  {deletingId === confirmDeleteId ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
          </div>
        )}
      </PageLayout>
    </Layout>
  );
}
