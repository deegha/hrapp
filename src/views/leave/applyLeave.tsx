import {
  PageLayout,
  Button,
  DatePicker,
  DateList,
  DocumentUploader,
  PageSubHeading,
  Dropdown,
  TextArea,
} from "@/components";
import {useLeave} from "./useLeave";
import {leaveTypes} from "@/utils/staticValues";

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
  } = useLeave();
  const isFormDisabled = selectedDates.length === 0;

  return (
    <PageLayout pageName="Leave Management - Request timeout">
      <div className="flex items-start gap-10">
        <div className="w-full">
          <div className="flex flex-col gap-[41px]">
            <div className="flex flex-col gap-5">
              <PageSubHeading heading="Select Dates" />
              <DatePicker onRangeChange={(range) => setSelectedRange(range)} />

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
                  options={leaveTypes}
                  value={leaveType}
                  onChange={setSelectedLeaveType}
                  placeholder="Pick a fruit"
                />
              </div>
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

        <div className="flex w-1/4 flex-col gap-10">
          <div className="flex flex-col items-start justify-center rounded-md border border-border p-10">
            <p className="text-sm">Days</p>
            <p className="text-lg font-semibold">20</p>
            <p className="text-sm font-semibold text-primary">+3</p>
          </div>
          <p>
            You have 20 days of remaining leave. Use them wisely for rejuvenation and personal
            pursuits. You&apos;ve earned them!
          </p>
        </div>
      </div>
    </PageLayout>
  );
}
