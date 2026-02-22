import {
  PageLayout,
  Button,
  DatePicker,
  DateList,
  DocumentUploader,
  PageSubHeading,
  Dropdown,
  TextArea,
  SingleDatePicker,
} from "@/components";
import {useLeave} from "./useLeave";

export function ApplyLeave() {
  const {
    handleDocumentUpload,
    onSubmit,
    selectedRange,
    setNotes,
    loading,
    selectedDates,
    setSelectedRange,
    setSelectedDates,
    notes,
    leaveType,
    setSelectedLeaveType,
    leaveTypes,
    leaveBalance,
    bookedDates,
    getSelectedLeaveTypeBalance,
    hasNoRemainingDays,
    coveringDate,
    handleCoveringDateChange,
  } = useLeave();
  const isFormDisabled = selectedDates.length === 0 || hasNoRemainingDays();

  return (
    <PageLayout pageName="Leave Management - Request timeout">
      <div className="flex flex-col gap-10 md:flex-row md:items-start">
        <div className="w-full">
          <div className="flex flex-col gap-[41px]">
            <div className="flex flex-col gap-5">
              <PageSubHeading heading="Select Dates" />
              <DatePicker
                onRangeChange={(range) => setSelectedRange(range)}
                bookedDates={bookedDates}
                selectedRange={selectedRange}
              />

              {selectedRange.start && selectedRange.end && (
                <DateList
                  dateList={selectedDates}
                  selectedRange={selectedRange}
                  onDateSelect={(dates) => setSelectedDates(dates)}
                />
              )}
            </div>

            <div className="flex flex-col gap-5">
              <PageSubHeading heading="Leave type" />
              <div className="w-[100px]">
                <Dropdown
                  options={leaveTypes.map((type) => ({
                    ...type,
                    disabled: type.isLieuLeave && selectedDates.length > 1,
                    tooltip:
                      type.isLieuLeave && selectedDates.length > 1
                        ? "Lieu leave is only available for single-day selections. Select one day to enable this option."
                        : undefined,
                  }))}
                  value={leaveType}
                  onChange={setSelectedLeaveType}
                  placeholder="Pick a leave type"
                />
              </div>

              {hasNoRemainingDays() && (
                <div className="rounded-md border border-red-200 bg-red-50 p-3">
                  <p className="text-sm text-red-800">
                    ⚠️ No remaining days for {getSelectedLeaveTypeBalance()?.name}. Please select a
                    different leave type.
                  </p>
                </div>
              )}

              {/* Show covering date picker when lieu leave type is selected */}
              {selectedDates.length === 1 &&
                leaveTypes.find((type) => type.value === leaveType.value)?.isLieuLeave && (
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold text-gray-700">
                      Select covering date for lieu leave:
                    </label>
                    <SingleDatePicker
                      onDateChange={handleCoveringDateChange}
                      selectedDate={coveringDate}
                    />
                  </div>
                )}
            </div>

            <div className="flex flex-col gap-5">
              <PageSubHeading heading="Upload supporting documents" />
              <DocumentUploader onUploadComplete={handleDocumentUpload} />
            </div>

            <div className="flex flex-col gap-5">
              <PageSubHeading heading="Any additional notes" />
              <TextArea
                value={notes}
                onChange={setNotes}
                placeholder="Write your thoughts here..."
              />
            </div>
            <div className="flex w-full justify-end">
              <div className="w-[150px]">
                <Button
                  loading={loading}
                  type="submit"
                  onClick={() => onSubmit()}
                  disabled={isFormDisabled}
                >
                  Request leave
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="flex w-[320px] flex-col gap-6" style={{width: "320px"}}>
          <div className="flex flex-col gap-4">
            <h3 className="text-base font-semibold">Leave Balance</h3>
          </div>
          <div className="flex flex-col gap-4">
            {leaveBalance?.leaveTypeBalances
              ?.filter((balance) => balance.name !== "Lieu Leave")
              ?.map((balance) => (
                <div
                  key={balance.id}
                  className="flex flex-col items-start justify-center rounded-md border border-border p-4"
                >
                  <p className="text-sm font-medium">{balance.name}</p>
                  <p className="text-lg font-semibold">{balance.remainingDays}</p>
                  <p className="text-xs text-gray-500">
                    {balance.usedDays} used / {balance.yearlyAllowance} total
                  </p>
                </div>
              ))}

            {leaveBalance && (
              <div className="bg-primary/5 flex flex-col items-start justify-center rounded-md border border-primary p-4">
                <p className="text-sm font-medium">Total Remaining</p>
                <p className="text-lg font-semibold text-primary">{leaveBalance.remainingDays}</p>
                <p className="text-xs text-gray-500">
                  {leaveBalance.usedDays} used / {leaveBalance.yearlyAllowance} total
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
