import moment from "moment";

interface IAttendanceDateFilter {
  fromDate: string;
  toDate: string;
  onChange: (from: string, to: string) => void;
}

const PRESETS = [
  {label: "Last 30 days", days: 30},
  {label: "Last 60 days", days: 60},
  {label: "Last 90 days", days: 90},
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
    <div className="flex flex-wrap items-center gap-3">
      {/* Preset buttons */}
      <div className="flex gap-2">
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
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
              activePreset === preset.days
                ? "bg-gray-900 text-gray-600 hover:bg-gray-200"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {preset.label}
          </button>
        ))}
      </div>

      {/* Divider */}
      <span className="text-xs text-gray-300">|</span>

      {/* Custom date range */}
      <div className="flex items-center gap-2">
        <input
          type="date"
          value={fromDate}
          max={toDate}
          onChange={(e) => onChange(e.target.value, toDate)}
          className="rounded-lg border border-gray-200 px-2 py-1.5 text-xs text-gray-700 focus:outline-none focus:ring-1 focus:ring-gray-400"
        />
        <span className="text-xs text-gray-400">to</span>
        <input
          type="date"
          value={toDate}
          min={fromDate}
          max={moment().format("YYYY-MM-DD")}
          onChange={(e) => onChange(fromDate, e.target.value)}
          className="rounded-lg border border-gray-200 px-2 py-1.5 text-xs text-gray-700 focus:outline-none focus:ring-1 focus:ring-gray-400"
        />
      </div>
    </div>
  );
}
