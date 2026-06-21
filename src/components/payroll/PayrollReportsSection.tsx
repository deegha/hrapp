import {TPayroll} from "@/types/payroll";
import {FileText, CreditCard, Download, Layers} from "react-feather";

// ── CSV / file helpers ────────────────────────────────────────────────────────

function downloadFile(content: string, filename: string, mime = "text/csv") {
  const blob = new Blob([content], {type: mime});
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function csv(rows: (string | number | null | undefined)[][]): string {
  return rows
    .map((r) => r.map((v) => (v == null ? "" : `"${String(v).replace(/"/g, '""')}"`)).join(","))
    .join("\n");
}

function fmtLKR(n: number) {
  return n.toFixed(2);
}

function periodLabel(start: string) {
  const s = new Date(start);
  return `${s.toLocaleDateString("en-US", {month: "long", year: "numeric"})}`;
}

// ── Document generators ───────────────────────────────────────────────────────

function genEPFFormC(payroll: TPayroll) {
  const header = [
    ["EPF Form C – Monthly Return", "", "", "", "", ""],
    [`Period: ${periodLabel(payroll.periodStart)}`, "", "", "", "", ""],
    [],
    [
      "Employee Name",
      "NIC",
      "Gross Earnings (LKR)",
      "EPF Employee 8% (LKR)",
      "EPF Employer 12% (LKR)",
      "Total EPF (LKR)",
    ],
  ];
  const rows = payroll.entries.map((e) => [
    e.user ? `${e.user.firstName} ${e.user.lastName}` : `User ${e.userId}`,
    e.user?.userInformation?.nic ?? "",
    fmtLKR(e.adjustedGross),
    fmtLKR(e.epfEmployee),
    fmtLKR(e.epfEmployer),
    fmtLKR(e.epfEmployee + e.epfEmployer),
  ]);
  const totals = payroll.entries.reduce(
    (acc, e) => {
      acc[0] += e.adjustedGross;
      acc[1] += e.epfEmployee;
      acc[2] += e.epfEmployer;
      return acc;
    },
    [0, 0, 0],
  );
  const footer = [
    [
      "TOTAL",
      "",
      fmtLKR(totals[0]),
      fmtLKR(totals[1]),
      fmtLKR(totals[2]),
      fmtLKR(totals[1] + totals[2]),
    ],
  ];
  downloadFile(
    csv([...header, ...rows, [], ...footer]),
    `EPF_Form_C_${periodLabel(payroll.periodStart).replace(" ", "_")}.csv`,
  );
}

function genETFR4(payroll: TPayroll) {
  const header = [
    ["ETF R4 Report – Monthly Return", "", "", ""],
    [`Period: ${periodLabel(payroll.periodStart)}`, "", "", ""],
    [],
    ["Employee Name", "NIC", "Gross Salary (LKR)", "ETF Employer 3% (LKR)"],
  ];
  const rows = payroll.entries.map((e) => [
    e.user ? `${e.user.firstName} ${e.user.lastName}` : `User ${e.userId}`,
    e.user?.userInformation?.nic ?? "",
    fmtLKR(e.adjustedGross),
    fmtLKR(e.etfEmployer),
  ]);
  const totalETF = payroll.entries.reduce((s, e) => s + e.etfEmployer, 0);
  const footer = [["TOTAL", "", "", fmtLKR(totalETF)]];
  downloadFile(
    csv([...header, ...rows, [], ...footer]),
    `ETF_R4_${periodLabel(payroll.periodStart).replace(" ", "_")}.csv`,
  );
}

function genAPITForm2(payroll: TPayroll) {
  const month = new Date(payroll.periodStart).getMonth() + 1;
  const halfYear = month <= 6 ? "January – June" : "July – December";
  const year = new Date(payroll.periodStart).getFullYear();
  const header = [
    ["APIT Form 2 – Bi-Annual PAYE Return", "", "", "", "", ""],
    [`Period: ${halfYear} ${year}`, "", "", "", "", ""],
    [],
    [
      "Employee Name",
      "NIC",
      "Monthly Gross (LKR)",
      "Monthly Taxable (LKR)",
      "Monthly PAYE Tax (LKR)",
      "Estimated Annual Tax (LKR)",
    ],
  ];
  const rows = payroll.entries
    .filter((e) => !e.isFlatSalary)
    .map((e) => [
      e.user ? `${e.user.firstName} ${e.user.lastName}` : `User ${e.userId}`,
      e.user?.userInformation?.nic ?? "",
      fmtLKR(e.adjustedGross),
      fmtLKR(e.adjustedGross - e.epfEmployee),
      fmtLKR(e.monthlyTax),
      fmtLKR(e.monthlyTax * 12),
    ]);
  const totalTax = payroll.entries
    .filter((e) => !e.isFlatSalary)
    .reduce((s, e) => s + e.monthlyTax, 0);
  const footer = [["TOTAL", "", "", "", fmtLKR(totalTax), fmtLKR(totalTax * 12)]];
  downloadFile(
    csv([...header, ...rows, [], ...footer]),
    `APIT_Form2_${year}_${halfYear.split(" ")[0]}.csv`,
  );
}

function genT10(payroll: TPayroll) {
  const totals = payroll.entries.reduce(
    (acc, e) => {
      acc.gross += e.adjustedGross;
      acc.epfEmp += e.epfEmployee;
      acc.epfEr += e.epfEmployer;
      acc.etf += e.etfEmployer;
      acc.tax += e.monthlyTax;
      acc.net += e.netSalary;
      acc.cost += e.totalCost;
      return acc;
    },
    {gross: 0, epfEmp: 0, epfEr: 0, etf: 0, tax: 0, net: 0, cost: 0},
  );
  const content = csv([
    ["T10 Form – Statutory Summary", ""],
    [`Period: ${periodLabel(payroll.periodStart)}`, ""],
    [],
    ["Field", "Amount (LKR)"],
    ["Total Employees", payroll.entries.length],
    ["Total Gross Salary", fmtLKR(totals.gross)],
    ["Total EPF Employee (8%)", fmtLKR(totals.epfEmp)],
    ["Total EPF Employer (12%)", fmtLKR(totals.epfEr)],
    ["Total ETF Employer (3%)", fmtLKR(totals.etf)],
    ["Total PAYE Tax Withheld", fmtLKR(totals.tax)],
    ["Total Net Salaries Paid", fmtLKR(totals.net)],
    ["Total Cost to Company", fmtLKR(totals.cost)],
  ]);
  downloadFile(content, `T10_${periodLabel(payroll.periodStart).replace(" ", "_")}.csv`);
}

function genBankFile(payroll: TPayroll) {
  const header = [
    ["Account Number", "Bank", "Employee Name", "Employee ID", "Net Salary (LKR)", "Reference"],
  ];
  const period = periodLabel(payroll.periodStart);
  const rows = payroll.entries.map((e) => [
    e.user?.userInformation?.bankAccountNumber ?? "",
    e.user?.userInformation?.bank ?? "",
    e.user ? `${e.user.firstName} ${e.user.lastName}` : `User ${e.userId}`,
    e.user?.employeeId ? `EMP-${e.user.employeeId}` : "",
    fmtLKR(e.netSalary),
    `Salary ${period}`,
  ]);
  downloadFile(csv([...header, ...rows]), `Bank_Salary_File_${period.replace(" ", "_")}.csv`);
}

function genEPFETFElectronic(payroll: TPayroll) {
  const period = periodLabel(payroll.periodStart);
  const lines = [
    `HDR|EPF_ETF_ERETURN|${period}|${payroll.entries.length}`,
    ...payroll.entries.map((e) => {
      const name = e.user ? `${e.user.firstName} ${e.user.lastName}` : `User ${e.userId}`;
      const nic = e.user?.userInformation?.nic ?? "";
      return [
        "DET",
        name.padEnd(40).slice(0, 40),
        nic.padEnd(12).slice(0, 12),
        String(e.adjustedGross).padStart(12, "0"),
        String(e.epfEmployee).padStart(10, "0"),
        String(e.epfEmployer).padStart(10, "0"),
        String(e.etfEmployer).padStart(10, "0"),
      ].join("|");
    }),
    `TRL|${payroll.entries
      .reduce((s, e) => s + e.epfEmployee + e.epfEmployer, 0)
      .toString()
      .padStart(12, "0")}|${payroll.entries
      .reduce((s, e) => s + e.etfEmployer, 0)
      .toString()
      .padStart(10, "0")}`,
  ];
  downloadFile(
    lines.join("\n"),
    `EPF_ETF_Electronic_${period.replace(" ", "_")}.txt`,
    "text/plain",
  );
}

// ── Card UI ───────────────────────────────────────────────────────────────────

type DocCard = {
  icon: React.ReactNode;
  title: string;
  description: string;
  badge: string;
  color: string;
  onDownload: () => void;
};

function ReportCard({icon, title, description, badge, color, onDownload}: DocCard) {
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border bg-white p-5 shadow-sm transition hover:shadow-md">
      <div className="flex items-start justify-between">
        <div className={`flex size-10 items-center justify-center rounded-lg ${color}`}>{icon}</div>
        <span className="rounded-full border border-border px-2 py-0.5 font-mono text-xs text-textSecondary">
          {badge}
        </span>
      </div>
      <div className="flex-1">
        <p className="text-sm font-semibold text-textPrimary">{title}</p>
        <p className="mt-1 text-xs leading-relaxed text-textSecondary">{description}</p>
      </div>
      <button
        onClick={onDownload}
        className="bg-primary/5 flex items-center justify-center gap-2 rounded-lg border border-primary px-3 py-2 text-xs font-medium text-primary transition hover:bg-primary hover:text-white"
      >
        <Download size={12} />
        Download
      </button>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export function PayrollReportsSection({payroll}: {payroll: TPayroll}) {
  const statutory: DocCard[] = [
    {
      icon: <FileText size={18} className="text-blue-600" />,
      title: "EPF Form C",
      description:
        "Monthly EPF return listing each employee's NIC, gross earnings, and 8% employee + 12% employer contributions for the Department of Labour.",
      badge: "CSV",
      color: "bg-blue-50",
      onDownload: () => genEPFFormC(payroll),
    },
    {
      icon: <Layers size={18} className="text-purple-600" />,
      title: "ETF R4 Report",
      description:
        "Monthly ETF Board report detailing the mandatory 3% employer contribution for each employee, formatted for the ETFB.",
      badge: "CSV",
      color: "bg-purple-50",
      onDownload: () => genETFR4(payroll),
    },
    {
      icon: <FileText size={18} className="text-orange-600" />,
      title: "APIT Form 2",
      description:
        "Bi-annual Advance Personal Income Tax return confirming accurate PAYE withholding per employee for the Inland Revenue Department.",
      badge: "CSV",
      color: "bg-orange-50",
      onDownload: () => genAPITForm2(payroll),
    },
    {
      icon: <FileText size={18} className="text-green-600" />,
      title: "T10 Form",
      description:
        "Statutory summary of total employee count, gross salaries, and all statutory deductions submitted periodically to the Department of Labour.",
      badge: "CSV",
      color: "bg-green-50",
      onDownload: () => genT10(payroll),
    },
  ];

  const banking: DocCard[] = [
    {
      icon: <CreditCard size={18} className="text-teal-600" />,
      title: "Bank Salary File",
      description:
        "Bulk transfer file with each employee's account number, bank, and net salary amount. Upload directly to your corporate banking portal for automated direct deposits.",
      badge: "CSV",
      color: "bg-teal-50",
      onDownload: () => genBankFile(payroll),
    },
    {
      icon: <Layers size={18} className="text-indigo-600" />,
      title: "EPF & ETF Electronic Media",
      description:
        "Digital text file formatted for the Central Bank's e-return system, eliminating paper submission for both EPF and ETF monthly contributions.",
      badge: "TXT",
      color: "bg-indigo-50",
      onDownload: () => genEPFETFElectronic(payroll),
    },
  ];

  return (
    <div className="mt-6 rounded-xl border border-border bg-background p-6">
      <div className="mb-5 flex items-center gap-3">
        <div className="bg-primary/10 flex size-8 items-center justify-center rounded-lg">
          <Download size={15} className="text-primary" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-textPrimary">Post-Approval Documents</h3>
          <p className="text-xs text-textSecondary">
            Download all required compliance and banking files for this payroll period.
          </p>
        </div>
      </div>

      <div className="mb-4">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-textSecondary">
          Statutory & Government Compliance
        </p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {statutory.map((c) => (
            <ReportCard key={c.title} {...c} />
          ))}
        </div>
      </div>

      <div className="mt-5">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-textSecondary">
          Banking & Disbursement
        </p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-2">
          {banking.map((c) => (
            <ReportCard key={c.title} {...c} />
          ))}
        </div>
      </div>
    </div>
  );
}
