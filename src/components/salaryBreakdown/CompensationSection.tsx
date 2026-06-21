import {useFormContext, useWatch} from "react-hook-form";
import {FormCurrencyInput} from "@/components/formCurrencyInput/formCurrencyInput";
import {SalaryBreakdownPanel} from "./SalaryBreakdownPanel";
import {useSalaryBreakdown} from "@/hooks/useSalaryBreakdown";
import {DollarSign} from "react-feather";

export function CompensationSection() {
  const {register} = useFormContext();
  const salary = useWatch({name: "salary"}) as number | undefined;
  const isFlatSalary = useWatch({name: "isFlatSalary"}) as boolean | undefined;

  const {breakdown, isLoading} = useSalaryBreakdown(salary, isFlatSalary);

  return (
    <div className="rounded-xl border border-border bg-white shadow-sm">
      <div className="flex items-center gap-2 border-b border-border bg-background px-6 py-4">
        <DollarSign size={15} className="text-primary" />
        <h2 className="text-sm font-semiBold text-textPrimary">Compensation</h2>
      </div>
      <div className="p-6">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <FormCurrencyInput name="salary" label="Gross Salary (LKR)" />
          <div className="flex items-end pb-1">
            <label className="flex cursor-pointer items-center gap-3">
              <div className="relative">
                <input type="checkbox" className="sr-only" {...register("isFlatSalary")} />
                <div
                  className={`h-5 w-9 rounded-full transition-colors ${
                    isFlatSalary ? "bg-primary" : "bg-border"
                  }`}
                />
                <div
                  className={`absolute left-0.5 top-0.5 size-4 rounded-full bg-white shadow transition-transform ${
                    isFlatSalary ? "translate-x-4" : "translate-x-0"
                  }`}
                />
              </div>
              <div>
                <p className="text-sm font-semibold text-textPrimary">Flat Salary</p>
                <p className="text-xs text-textSecondary">No EPF / ETF / tax deductions</p>
              </div>
            </label>
          </div>
        </div>

        {!isFlatSalary && (
          <SalaryBreakdownPanel breakdown={breakdown} isLoading={isLoading && !!salary} />
        )}
      </div>
    </div>
  );
}
