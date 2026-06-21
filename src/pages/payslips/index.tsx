import {Layout, PageLayout, Shimmer, NoDataFoundComponent} from "@/components";
import useSWR from "swr";
import {useState} from "react";
import {fetchPayslips, fetchPayslip} from "@/services/payrollService";
import {TPayslipEntry} from "@/types/payroll";
import {generatePayslipPDF} from "@/utils/generatePayslipPDF";
import {Download, FileText, Calendar, ChevronDown, Eye, EyeOff} from "react-feather";
import {useNotificationStore} from "@/store/notificationStore";

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const currentYear = new Date().getFullYear();
const YEARS = Array.from({length: 5}, (_, i) => currentYear - i);

const HIDDEN = "LKR ••••••";

function fmt(n: number) {
  return `LKR ${new Intl.NumberFormat("en-US").format(n)}`;
}

function fmtHidden(n: number, revealed: boolean) {
  return revealed ? fmt(n) : HIDDEN;
}

function fmtDeductionsHidden(epf: number, tax: number, revealed: boolean) {
  return revealed ? `EPF: −${fmt(epf)} · Tax: −${fmt(tax)}` : "EPF: −•••••• · Tax: −••••••";
}

export default function PayslipsPage() {
  const {showNotification} = useNotificationStore();
  const [year, setYear] = useState<number>(currentYear);
  const [month, setMonth] = useState<number | undefined>(undefined);
  const [revealed, setRevealed] = useState(false);
  const [downloadingId, setDownloadingId] = useState<number | null>(null);

  const {data, isLoading} = useSWR(`payslips-${year}-${month ?? "all"}`, () =>
    fetchPayslips(year, month),
  );
  const payslips = data?.data ?? [];

  const handleDownload = async (payrollId: number) => {
    setDownloadingId(payrollId);
    try {
      const res = await fetchPayslip(payrollId);
      generatePayslipPDF(res.data);
    } catch {
      showNotification({type: "error", message: "Failed to load payslip"});
    } finally {
      setDownloadingId(null);
    }
  };

  const grouped = payslips.reduce<Record<string, TPayslipEntry[]>>((acc, p) => {
    const y = new Date(p.payroll.periodStart).getFullYear().toString();
    if (!acc[y]) acc[y] = [];
    acc[y].push(p);
    return acc;
  }, {});

  return (
    <Layout>
      <PageLayout pageName="Payslips">
        {/* Filter + privacy bar */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 rounded-lg border border-border bg-white px-3 py-2 shadow-sm">
              <Calendar size={14} className="text-textSecondary" />
              <span className="text-xs text-textSecondary">Year</span>
              <div className="relative">
                <select
                  value={year}
                  onChange={(e) => setYear(Number(e.target.value))}
                  className="appearance-none bg-transparent pr-5 text-sm font-semibold text-textPrimary focus:outline-none"
                >
                  {YEARS.map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  size={12}
                  className="pointer-events-none absolute right-0 top-1 text-textSecondary"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 rounded-lg border border-border bg-white px-3 py-2 shadow-sm">
              <span className="text-xs text-textSecondary">Month</span>
              <div className="relative">
                <select
                  value={month ?? ""}
                  onChange={(e) => setMonth(e.target.value ? Number(e.target.value) : undefined)}
                  className="appearance-none bg-transparent pr-5 text-sm font-semibold text-textPrimary focus:outline-none"
                >
                  <option value="">All months</option>
                  {MONTHS.map((m, i) => (
                    <option key={m} value={i + 1}>
                      {m}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  size={12}
                  className="pointer-events-none absolute right-0 top-1 text-textSecondary"
                />
              </div>
            </div>

            {month && (
              <button
                onClick={() => setMonth(undefined)}
                className="text-xs text-textSecondary underline hover:text-textPrimary"
              >
                Clear filter
              </button>
            )}
          </div>

          {/* Privacy toggle */}
          <button
            onClick={() => setRevealed((v) => !v)}
            className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-medium shadow-sm transition ${
              revealed
                ? "border-primary/30 bg-primary/5 hover:bg-primary/10 text-primary"
                : "hover:border-primary/30 border-border bg-white text-textSecondary hover:text-primary"
            }`}
          >
            {revealed ? <EyeOff size={14} /> : <Eye size={14} />}
            {revealed ? "Hide amounts" : "Reveal amounts"}
          </button>
        </div>

        {/* Hidden-amounts banner */}
        {!revealed && payslips.length > 0 && (
          <div className="mb-5 flex items-center gap-3 rounded-lg border border-border bg-background px-4 py-3">
            <EyeOff size={14} className="shrink-0 text-textSecondary" />
            <p className="text-xs text-textSecondary">
              Amounts are hidden for privacy. Click{" "}
              <button
                onClick={() => setRevealed(true)}
                className="font-semibold text-primary underline-offset-2 hover:underline"
              >
                Reveal amounts
              </button>{" "}
              to view your payslip figures.
            </p>
          </div>
        )}

        {isLoading ? (
          <Shimmer />
        ) : payslips.length === 0 ? (
          <div className="py-6">
            <NoDataFoundComponent />
          </div>
        ) : (
          <div className="flex flex-col gap-8">
            {Object.entries(grouped)
              .sort(([a], [b]) => Number(b) - Number(a))
              .map(([y, entries]) => (
                <div key={y}>
                  <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-textSecondary">
                    {y}
                  </p>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {entries.map((p) => {
                      const start = new Date(p.payroll.periodStart);
                      const monthName = start.toLocaleDateString("en-US", {month: "long"});
                      const isDownloading = downloadingId === p.payrollId;

                      return (
                        <div
                          key={p.id}
                          className="flex flex-col gap-4 rounded-xl border border-border bg-white p-5 shadow-sm transition hover:shadow-md"
                        >
                          {/* Card header */}
                          <div className="flex items-start justify-between">
                            <div className="bg-primary/10 flex size-10 items-center justify-center rounded-lg">
                              <FileText size={18} className="text-primary" />
                            </div>
                            <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-700">
                              Approved
                            </span>
                          </div>

                          {/* Period */}
                          <div>
                            <p className="text-base font-bold text-textPrimary">
                              {monthName} {y}
                            </p>
                            <p className="mt-0.5 text-xs text-textSecondary">
                              {new Date(p.payroll.periodStart).toLocaleDateString()} –{" "}
                              {new Date(p.payroll.periodEnd).toLocaleDateString()}
                            </p>
                          </div>

                          {/* Net pay */}
                          <div className="rounded-lg bg-background px-3 py-2.5">
                            <p className="text-xs text-textSecondary">Net Take-Home</p>
                            <p
                              className={`font-mono text-base font-bold transition-all ${revealed ? "text-textPrimary" : "select-none tracking-widest text-textSecondary"}`}
                            >
                              {fmtHidden(p.netSalary, revealed)}
                            </p>
                            {!p.isFlatSalary && (
                              <p
                                className={`mt-0.5 text-xs transition-all ${revealed ? "text-textSecondary" : "text-textSecondary/50 select-none tracking-widest"}`}
                              >
                                {fmtDeductionsHidden(p.epfEmployee, p.monthlyTax, revealed)}
                              </p>
                            )}
                          </div>

                          {/* Download */}
                          <button
                            onClick={() => handleDownload(p.payrollId)}
                            disabled={isDownloading}
                            className="bg-primary/5 flex w-full items-center justify-center gap-2 rounded-lg border border-primary py-2 text-xs font-semibold text-primary transition hover:bg-primary hover:text-white disabled:opacity-60"
                          >
                            <Download size={13} />
                            {isDownloading ? "Preparing..." : "Download Payslip"}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
          </div>
        )}
      </PageLayout>
    </Layout>
  );
}
