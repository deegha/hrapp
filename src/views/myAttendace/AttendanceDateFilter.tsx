import moment from "moment";
import {Calendar} from "react-feather";

interface IAttendanceDateFilter {
  fromDate: string;
  toDate: string;
  onChange: (from: string, to: string) => void;
}

const PRESETS = [
  {label: "30 days", days: 30},
  {label: "60 days", days: 60},
  {label: "90 days", days: 90},
];

export function AttendanceDateFilter({fromDate, toDate, onChange}: IAttendanceDateFilter) {
  const activePreset = PRESETS.find(
    (p) =>
      fromDate ===
        moment()
          .subtract(p.days - 1, "days")
          .format("YYYY-MM-DD") && toDate === moment().format("YYYY-MM-DD"),
  )?.days;

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-xl border border-border bg-white px-4 py-3 shadow-sm">
      {/* Preset pills */}
      <div className="flex items-center gap-1.5">
        <span className="mr-1 text-xs font-semibold uppercase tracking-wide text-textSecondary">
          Range
        </span>
        {PRESETS.map((preset) => (
          <button
            key={preset.days}
            type="button"
            onClick={() =>
              onChange(
                moment()
                  .subtract(preset.days - 1, "days")
                  .format("YYYY-MM-DD"),
                moment().format("YYYY-MM-DD"),
              )
            }
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
              activePreset === preset.days
                ? "bg-primary text-white shadow-sm"
                : "bg-background text-textSecondary hover:bg-gray-200 hover:text-textPrimary"
            }`}
          >
            {preset.label}
          </button>
        ))}
      </div>

      {/* Divider */}
      <div className="h-6 w-px bg-border" />

      {/* Custom date range */}
      <div className="flex items-center gap-2">
        <Calendar size={14} className="shrink-0 text-textSecondary" />
        <div className="flex items-center gap-2">
          <div className="flex flex-col">
            <label className="mb-0.5 text-xs font-semibold uppercase tracking-wide text-textSecondary">
              From
            </label>
            <input
              type="date"
              value={fromDate}
              max={toDate}
              onChange={(e) => onChange(e.target.value, toDate)}
              className="rounded-lg border border-border bg-background px-2.5 py-1.5 text-xs font-medium text-textPrimary focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
          <span className="mt-3 text-xs font-medium text-textSecondary">→</span>
          <div className="flex flex-col">
            <label className="mb-0.5 text-xs font-semibold uppercase tracking-wide text-textSecondary">
              To
            </label>
            <input
              type="date"
              value={toDate}
              min={fromDate}
              max={moment().format("YYYY-MM-DD")}
              onChange={(e) => onChange(fromDate, e.target.value)}
              className="rounded-lg border border-border bg-background px-2.5 py-1.5 text-xs font-medium text-textPrimary focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
