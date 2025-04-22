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
import { useForm, SubmitHandler } from "react-hook-form";
import { useState } from "react";
import { useNotificationStore } from "@/store/notificationStore";
import { TLeaves } from "@/types/leave";
import { createLeaveRequest } from "@/services";

type TApplyLeave = {
  from: Date;
  to: Date;
};

const options = [
  { label: "Annual", value: "1" },
  { label: "Casual", value: "2" },
  { label: "Medical", value: "3" },
];

export function ApplyLeave() {
  const { handleSubmit } = useForm<TApplyLeave>();
  const [selectedRange, setSelectedRange] = useState<{
    start: Date | null;
    end: Date | null;
  }>({ start: null, end: null });
  const [leaveType, setSelectedLeaveType] = useState(options[0]);
  const [notes, setNotes] = useState("");
  const [leaves, setLeaves] = useState<TLeaves[]>([]);
  const [documents, setDocuments] = useState<Array<string>>();
  const { showNotification } = useNotificationStore();

  const handleDocumentUpload = (url: string) => {
    if (!url) {
      showNotification({
        message: "Something went wrong when uploading image",
        type: "error",
      });
    }

    const newDocs = documents;
    newDocs?.push(url);
    setDocuments(newDocs);
  };

  const onSubmit: SubmitHandler<TApplyLeave> = async (data) => {
    try {
      await createLeaveRequest({
        leaves,
        leaveType: leaveType.value,
        documents,
        additionalNotes: notes,
      });

      showNotification({
        message: "Uploaded successfully!",
        type: "success",
      });
    } catch {
      console.log("here we are");
      showNotification({
        message: "Something went wrong when submitting request",
        type: "error",
      });
    }
  };

  return (
    <PageLayout pageName="Leave Management - Request timeout" enableBack>
      <div className="flex items-start  gap-10">
        <div className="w-full">
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col gap-[41px] "
          >
            <div className="flex flex-col gap-5">
              <PageSubHeading heading="Select Dates" />
              <DatePicker onRangeChange={(range) => setSelectedRange(range)} />

              {selectedRange.start && selectedRange.end && (
                <DateList
                  dateList={leaves}
                  selectedRange={selectedRange}
                  onDateSelect={(dates) => setLeaves(dates)}
                />
              )}
            </div>

            <div className="flex flex-col gap-5">
              <PageSubHeading heading="Leave type" />
              <div className="w-[100px]">
                <Dropdown
                  options={options}
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
            <div className="w-full flex justify-end">
              <div className="w-[150px]">
                <Button type="submit">Request leave</Button>
              </div>
            </div>
          </form>
        </div>

        <div className="flex flex-col w-1/4 gap-10 ">
          <div className=" border border-border flex flex-col items-start justify-center p-10 rounded-md ">
            <p className="text-sm">Days</p>
            <p className="text-lg font-semibold">20</p>
            <p className="text-sm text-primary font-semibold">+3</p>
          </div>
          <p>
            You have 20 days of remaining leave. Use them wisely for
            rejuvenation and personal pursuits. You&apos;ve earned them!
          </p>
        </div>
      </div>
    </PageLayout>
  );
}
