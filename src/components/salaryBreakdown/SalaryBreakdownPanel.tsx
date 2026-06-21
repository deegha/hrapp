import {SalaryBreakdown} from "@/services/statutoryService";

const fmt = (n: number, currency = "LKR") =>
  `${currency} ${new Intl.NumberFormat("en-US").format(n)}`;

const Row = ({label, value, bold}: {label: string; value: string; bold?: boolean}) => (
  <div
    className={`flex items-center justify-between py-2 ${bold ? "border-t border-border" : "border-border/50 border-t"}`}
  >
    <span className={`text-xs ${bold ? "font-semibold text-textPrimary" : "text-textSecondary"}`}>
      {label}
    </span>
    <span
      className={`font-mono text-xs ${bold ? "font-semibold text-textPrimary" : "text-textPrimary"}`}
    >
      {value}
    </span>
  </div>
);

type Props = {
  breakdown: SalaryBreakdown | null;
  isLoading?: boolean;
};

export function SalaryBreakdownPanel({breakdown, isLoading}: Props) {
  if (isLoading) {
    return (
      <div className="mt-3 animate-pulse rounded-lg border border-border bg-background p-4">
        <div className="mb-2 h-3 w-1/3 rounded bg-border" />
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="mt-2 flex justify-between">
            <div className="h-3 w-2/5 rounded bg-border" />
            <div className="h-3 w-1/4 rounded bg-border" />
          </div>
        ))}
      </div>
    );
  }

  if (!breakdown) return null;

  const c = breakdown.currency;

  return (
    <div className="mt-3 rounded-lg border border-border bg-background p-4">
      <p className="mb-1 text-xs font-semiBold text-textPrimary">Salary Breakdown</p>

      {/* Employee deductions */}
      <p className="mt-2 text-xs font-semibold uppercase tracking-wider text-textSecondary">
        Employee
      </p>
      <Row label="Gross Salary" value={fmt(breakdown.grossSalary, c)} />
      <Row label="EPF Deduction (8%)" value={`− ${fmt(breakdown.epfEmployee, c)}`} />
      <Row label="PAYE Tax" value={`− ${fmt(breakdown.monthlyTax, c)}`} />
      <Row label="Net Take-Home" value={fmt(breakdown.netSalary, c)} bold />

      {/* Employer contributions */}
      <p className="mt-3 text-xs font-semibold uppercase tracking-wider text-textSecondary">
        Employer
      </p>
      <Row label="Gross Salary" value={fmt(breakdown.grossSalary, c)} />
      <Row label="EPF Contribution (12%)" value={`+ ${fmt(breakdown.epfEmployer, c)}`} />
      <Row label="ETF Contribution (3%)" value={`+ ${fmt(breakdown.etfEmployer, c)}`} />
      <Row label="Total Cost to Company" value={fmt(breakdown.totalEmployerCost, c)} bold />
    </div>
  );
}
