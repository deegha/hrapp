import {useState} from "react";
import {TLeaveBalance, TCreateLeaveAdjustmentPayload} from "@/types/leaveAdjustment";
import {Button} from "@/components";
import {MinusCircle, PlusCircle, X} from "react-feather";

interface Props {
  balances: TLeaveBalance[];
  prefillLeaveTypeId?: number;
  onClose: () => void;
  onSubmit: (payload: TCreateLeaveAdjustmentPayload) => Promise<void>;
}

const defaultExpiry = () => `${new Date().getFullYear()}-12-31`;

export function LeaveAdjustModal({balances, prefillLeaveTypeId, onClose, onSubmit}: Props) {
  const [type, setType] = useState<"CREDIT" | "DEBIT">("CREDIT");
  const [leaveTypeId, setLeaveTypeId] = useState<number>(
    prefillLeaveTypeId ?? balances[0]?.leaveTypeId ?? 0,
  );
  const [days, setDays] = useState<string>("1");
  const [reason, setReason] = useState("");
  const [expiresAt, setExpiresAt] = useState<string>(defaultExpiry());
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const selected = balances.find((b) => b.leaveTypeId === leaveTypeId);
  const daysNum = parseInt(days) || 0;
  const canSubmit = daysNum > 0 && reason.trim().length > 0 && leaveTypeId > 0;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setError("");
    setSubmitting(true);
    try {
      await onSubmit({leaveTypeId, days: daysNum, type, reason: reason.trim(), expiresAt});
      onClose();
    } catch {
      setError("Failed to save adjustment. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <h2 className="text-base font-semibold text-textPrimary">Adjust Leave Balance</h2>
          <button
            onClick={onClose}
            className="text-textSecondary transition hover:text-textPrimary"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex flex-col gap-5 p-6">
          {/* Credit / Debit toggle */}
          <div className="flex rounded-xl border border-border bg-background p-1">
            <button
              onClick={() => setType("CREDIT")}
              className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-2 text-sm font-medium transition ${
                type === "CREDIT"
                  ? "bg-white text-green-600 shadow-sm"
                  : "text-textSecondary hover:text-textPrimary"
              }`}
            >
              <PlusCircle size={15} />
              Credit Days
            </button>
            <button
              onClick={() => setType("DEBIT")}
              className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-2 text-sm font-medium transition ${
                type === "DEBIT"
                  ? "bg-white text-red-500 shadow-sm"
                  : "text-textSecondary hover:text-textPrimary"
              }`}
            >
              <MinusCircle size={15} />
              Debit Days
            </button>
          </div>

          {/* Leave type */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-textPrimary">Leave Type</label>
            <select
              value={leaveTypeId}
              onChange={(e) => setLeaveTypeId(parseInt(e.target.value))}
              className="rounded-lg border border-border bg-white px-3 py-2 text-sm text-textPrimary focus:outline-none focus:ring-2 focus:ring-primary"
            >
              {balances.map((b) => (
                <option key={b.leaveTypeId} value={b.leaveTypeId}>
                  {b.label}
                </option>
              ))}
            </select>
            {selected && (
              <p className="text-xs text-textSecondary">
                Current balance:{" "}
                <span
                  className={`font-semibold ${selected.balance < 0 ? "text-red-500" : "text-green-600"}`}
                >
                  {selected.balance} day{selected.balance !== 1 ? "s" : ""}
                </span>{" "}
                ({selected.credited} credited, {selected.taken} taken)
              </p>
            )}
          </div>

          {/* Days */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-textPrimary">Number of Days</label>
            <input
              type="number"
              min={1}
              value={days}
              onChange={(e) => setDays(e.target.value)}
              className="rounded-lg border border-border bg-white px-3 py-2 text-sm text-textPrimary focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* Reason */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-textPrimary">
              Reason <span className="text-red-400">*</span>
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder={
                type === "CREDIT"
                  ? "e.g. Annual entitlement, carried over from Q1…"
                  : "e.g. Leave taken without prior request, adjustment…"
              }
              rows={3}
              className="resize-none rounded-lg border border-border bg-white px-3 py-2 text-sm text-textPrimary placeholder:text-textSecondary focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* Expiry date */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-textPrimary">Expires On</label>
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={expiresAt}
                min={new Date().toISOString().split("T")[0]}
                onChange={(e) => setExpiresAt(e.target.value)}
                className="flex-1 rounded-lg border border-border bg-white px-3 py-2 text-sm text-textPrimary focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <button
                type="button"
                onClick={() => setExpiresAt(defaultExpiry())}
                className="shrink-0 rounded-lg border border-border px-3 py-2 text-xs font-medium text-textSecondary hover:bg-background"
              >
                End of year
              </button>
            </div>
            <p className="text-xs text-textSecondary">
              After this date the adjustment will no longer count toward the balance.
            </p>
          </div>

          {/* Preview */}
          {canSubmit && selected && (
            <div
              className={`rounded-lg p-3 text-sm ${type === "CREDIT" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600"}`}
            >
              {type === "CREDIT" ? "+" : "−"}
              {daysNum} day{daysNum !== 1 ? "s" : ""} of {selected.label} will be{" "}
              {type === "CREDIT" ? "added to" : "removed from"} this employee&apos;s balance. New
              balance:{" "}
              <strong>
                {type === "CREDIT" ? selected.balance + daysNum : selected.balance - daysNum} days
              </strong>
              .
            </div>
          )}

          {error && <p className="text-sm text-red-500">{error}</p>}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 border-t border-border px-6 py-4">
          <button
            onClick={onClose}
            className="rounded-lg px-4 py-2 text-sm text-textSecondary hover:bg-background"
          >
            Cancel
          </button>
          <Button onClick={handleSubmit} disabled={!canSubmit || submitting}>
            {submitting
              ? "Saving…"
              : type === "CREDIT"
                ? `Credit ${daysNum || ""} Day${daysNum !== 1 ? "s" : ""}`
                : `Debit ${daysNum || ""} Day${daysNum !== 1 ? "s" : ""}`}
          </Button>
        </div>
      </div>
    </div>
  );
}
