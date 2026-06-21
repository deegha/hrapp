import {TPayslip} from "@/types/payroll";

const fmt = (n: number) => `LKR ${new Intl.NumberFormat("en-US").format(n)}`;

function periodLabel(start: string) {
  return new Date(start).toLocaleDateString("en-US", {month: "long", year: "numeric"});
}

function maskAccount(acc: string | null) {
  if (!acc) return "—";
  return acc.length > 4 ? `${"•".repeat(acc.length - 4)}${acc.slice(-4)}` : acc;
}

export function generatePayslipPDF(data: TPayslip) {
  const {entry, user} = data;
  const period = periodLabel(entry.payroll.periodStart);
  const empName = `${user.firstName} ${user.lastName}`;
  const empId = user.employeeId ? `EMP-${user.employeeId}` : "—";
  const jobTitle = user.JobRole?.title || user.userInformation?.position || "—";
  const dept = user.Department?.departmentName || "—";
  const epfNo = user.userInformation?.epfNumber || "—";
  const bank = user.userInformation?.bank || "—";
  const account = maskAccount(user.userInformation?.bankAccountNumber ?? null);
  const orgName = user.organization.organizationName;
  const generatedDate = new Date().toLocaleDateString("en-US", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const row = (label: string, value: string, bold = false, color = "") =>
    `<tr>
      <td style="padding:8px 12px;color:#6b7280;font-size:13px;">${label}</td>
      <td style="padding:8px 12px;text-align:right;font-size:13px;font-weight:${bold ? "700" : "500"};color:${color || "#111827"};font-family:monospace;">${value}</td>
    </tr>`;

  const section = (title: string, rows: string) =>
    `<div style="margin-bottom:20px;">
      <div style="background:#f9fafb;border-radius:8px;overflow:hidden;border:1px solid #e5e7eb;">
        <div style="padding:10px 12px;background:#f3f4f6;border-bottom:1px solid #e5e7eb;">
          <span style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:#6b7280;">${title}</span>
        </div>
        <table style="width:100%;border-collapse:collapse;">${rows}</table>
      </div>
    </div>`;

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8"/>
  <title>Payslip – ${period}</title>
  <style>
    *{box-sizing:border-box;margin:0;padding:0}
    body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#fff;color:#111827;-webkit-print-color-adjust:exact;print-color-adjust:exact}
    @page{size:A4;margin:20mm}
    @media print{.no-print{display:none}}
  </style>
</head>
<body style="padding:32px;max-width:720px;margin:0 auto;">

  <!-- Print button -->
  <div class="no-print" style="text-align:right;margin-bottom:16px;">
    <button onclick="window.print()" style="background:#10b981;color:#fff;border:none;padding:8px 20px;border-radius:8px;font-size:13px;cursor:pointer;font-weight:600;">
      ⬇ Download PDF
    </button>
  </div>

  <!-- Header -->
  <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:28px;padding-bottom:20px;border-bottom:2px solid #e5e7eb;">
    <div>
      <div style="font-size:22px;font-weight:800;color:#111827;letter-spacing:-0.5px;">${orgName}</div>
      <div style="margin-top:4px;font-size:13px;color:#6b7280;">Payslip for the period of <strong style="color:#111827;">${period}</strong></div>
    </div>
    <div style="text-align:right;">
      <div style="display:inline-block;background:#ecfdf5;border:1px solid #6ee7b7;border-radius:20px;padding:4px 14px;font-size:12px;font-weight:700;color:#059669;text-transform:uppercase;letter-spacing:.05em;">Approved</div>
      <div style="margin-top:6px;font-size:11px;color:#9ca3af;">Generated: ${generatedDate}</div>
    </div>
  </div>

  <!-- Employee info grid -->
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:24px;">
    <div style="background:#f9fafb;border-radius:8px;padding:14px 16px;border:1px solid #e5e7eb;">
      <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:#9ca3af;margin-bottom:8px;">Employee</div>
      <div style="font-size:16px;font-weight:700;color:#111827;">${empName}</div>
      <div style="font-size:12px;color:#6b7280;margin-top:2px;">${empId}</div>
      <div style="font-size:12px;color:#6b7280;margin-top:1px;">${jobTitle}</div>
      <div style="font-size:12px;color:#6b7280;margin-top:1px;">${dept}</div>
    </div>
    <div style="background:#f9fafb;border-radius:8px;padding:14px 16px;border:1px solid #e5e7eb;">
      <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:#9ca3af;margin-bottom:8px;">Payment Details</div>
      <div style="font-size:12px;color:#6b7280;">Bank: <span style="color:#111827;font-weight:600;">${bank}</span></div>
      <div style="font-size:12px;color:#6b7280;margin-top:3px;">Account: <span style="color:#111827;font-weight:600;font-family:monospace;">${account}</span></div>
      <div style="font-size:12px;color:#6b7280;margin-top:3px;">EPF No: <span style="color:#111827;font-weight:600;">${epfNo}</span></div>
      <div style="font-size:12px;color:#6b7280;margin-top:3px;">Working Days: <span style="color:#111827;font-weight:600;">${entry.paidDays} / ${entry.workingDays}</span></div>
    </div>
  </div>

  <!-- Earnings -->
  ${section(
    "Earnings",
    `
    ${row("Gross Salary", fmt(entry.grossSalary))}
    ${entry.leaveDays > 0 ? row(`Leave Deduction (${entry.leaveDays} day${entry.leaveDays !== 1 ? "s" : ""})`, `− ${fmt(entry.grossSalary - entry.adjustedGross)}`, false, "#dc2626") : ""}
    ${row("Adjusted Gross", fmt(entry.adjustedGross), true)}
  `,
  )}

  <!-- Deductions -->
  ${
    !entry.isFlatSalary
      ? section(
          "Deductions",
          `
    ${row("EPF – Employee Contribution (8%)", `− ${fmt(entry.epfEmployee)}`, false, "#dc2626")}
    ${row("PAYE Tax (APIT)", `− ${fmt(entry.monthlyTax)}`, false, "#dc2626")}
    ${row("Total Deductions", `− ${fmt(entry.epfEmployee + entry.monthlyTax)}`, true, "#dc2626")}
  `,
        )
      : '<div style="margin-bottom:20px;padding:12px 14px;background:#f0fdf4;border:1px solid #86efac;border-radius:8px;font-size:12px;color:#166534;">This employee is on a <strong>Flat Salary</strong> — no EPF/ETF/tax deductions apply.</div>'
  }

  <!-- Net Pay (hero) -->
  <div style="background:linear-gradient(135deg,#059669,#10b981);border-radius:12px;padding:20px 24px;margin-bottom:20px;display:flex;justify-content:space-between;align-items:center;">
    <div>
      <div style="font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:rgba(255,255,255,.7);">Net Take-Home Pay</div>
      <div style="font-size:28px;font-weight:800;color:#fff;font-family:monospace;margin-top:4px;">${fmt(entry.netSalary)}</div>
    </div>
    <div style="text-align:right;">
      <div style="font-size:11px;color:rgba(255,255,255,.7);">Period</div>
      <div style="font-size:14px;font-weight:700;color:#fff;margin-top:2px;">${period}</div>
    </div>
  </div>

  <!-- Employer contributions (informational) -->
  ${
    !entry.isFlatSalary
      ? section(
          "Employer Contributions (For Your Reference)",
          `
    ${row("EPF – Employer Contribution (12%)", fmt(entry.epfEmployer))}
    ${row("ETF – Employer Contribution (3%)", fmt(entry.etfEmployer))}
    ${row("Total Cost to Company", fmt(entry.totalCost), true)}
  `,
        )
      : ""
  }

  <!-- Footer -->
  <div style="margin-top:32px;padding-top:16px;border-top:1px solid #e5e7eb;display:flex;justify-content:space-between;align-items:center;">
    <div style="font-size:11px;color:#9ca3af;">This is a computer-generated payslip and does not require a signature.</div>
    <div style="font-size:11px;color:#9ca3af;">${orgName} · ${period}</div>
  </div>

</body>
</html>`;

  const win = window.open("", "_blank", "width=800,height=900");
  if (!win) return;
  win.document.write(html);
  win.document.close();
}
