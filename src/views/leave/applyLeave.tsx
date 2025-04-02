import {
  PageLayout,
  Button,
  InputField,
  DatePicker,
  DateList,
} from "@/components";
import { useForm, SubmitHandler } from "react-hook-form";
import { useState } from "react";

type TApplyLeave = {
  from: Date;
  to: Date;
};

type TLeaves = {
  date: Date;
  half: "AM" | "PM" | null;
};

export function ApplyLeave() {
  const { handleSubmit } = useForm<TApplyLeave>();
  const [selectedRange, setSelectedRange] = useState<{
    start: Date | null;
    end: Date | null;
  }>({ start: null, end: null });
  const [leaves, setLeaves] = useState<TLeaves[]>([]);

  const onSubmit: SubmitHandler<TApplyLeave> = async (data) => {
    try {
      console.log("dafd");
    } catch {
      console.log("here we are");
    }
  };

  console.log(leaves, "leaves");

  return (
    <PageLayout pageName="Leave Management - Request timeout" enableBack>
      <div className="flex items-start  gap-10">
        <div className="w-full">
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col gap-[41px] "
          >
            <DatePicker onRangeChange={(range) => setSelectedRange(range)} />

            {selectedRange.start && selectedRange.end && (
              <DateList
                dateList={leaves}
                selectedRange={selectedRange}
                onDateSelect={(dates) => setLeaves(dates)}
              />
            )}
            <div className="w-full flex justify-end">
              <div className="w-[150px]">
                <Button type="submit">Request leave</Button>
              </div>
            </div>
          </form>
        </div>

        <div className="flex flex-col w-1/4 gap-10 ">
          <div className=" border border-border flex flex-col items-start justify-center p-10 ">
            <p className="text-sm">Days</p>
            <p className="text-lg font-semibold">20</p>
            <p className="text-sm text-primary font-semibold">+3</p>
          </div>
          <p>
            You have 20 days of remaining leave. Use them wisely for
            rejuvenation and personal pursuits. You've earned them!
          </p>
        </div>
      </div>
    </PageLayout>
  );
}
