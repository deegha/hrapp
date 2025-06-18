import React, {useState} from "react";
import {format, addMonths, subMonths} from "date-fns";
import {ChevronLeft, ChevronRight} from "react-feather";

interface BookedDate {
  date: string;
  status: string;
  halfDay: string | null;
  leaveType: number;
}

interface IDatePickerProps {
  onRangeChange?: (range: {start: Date | null; end: Date | null}) => void;
  bookedDates?: BookedDate[];
  selectedRange?: {start: Date | null; end: Date | null};
}

export const DatePicker: React.FC<IDatePickerProps> = ({
  onRangeChange,
  bookedDates = [],
  selectedRange = {start: null, end: null},
}) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [hoverDate, setHoverDate] = useState<Date | null>(null);

  const generateMonthDays = (month: Date) => {
    const startOfMonth = new Date(month.getFullYear(), month.getMonth(), 1);
    const daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
    const startDay = startOfMonth.getDay();
    const prevMonthDays = Array.from({length: startDay}, (_, i) => i);
    const monthDays = Array.from({length: daysInMonth}, (_, i) => i + 1);
    return {prevMonthDays, monthDays};
  };

  const handlePrevMonth = (e: React.SyntheticEvent) => {
    e.preventDefault();
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  const handleNextMonth = (e: React.SyntheticEvent) => {
    e.preventDefault();
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  const handleDateClick = (day: number, monthOffset: number) => {
    const selectedDate = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth() + monthOffset,
      day,
    );

    let newRange;
    if (!selectedRange.start) {
      newRange = {start: selectedDate, end: selectedDate};
    } else if (
      selectedRange.start &&
      selectedRange.end &&
      selectedRange.start.getTime() === selectedRange.end.getTime()
    ) {
      // Single day selected - check if clicking different date for range
      if (selectedRange.start.getTime() === selectedDate.getTime()) {
        newRange = selectedRange;
      } else {
        newRange = {start: selectedRange.start, end: selectedDate};
      }
    } else {
      // Range exists - start new single day selection
      newRange = {start: selectedDate, end: selectedDate};
    }

    if (onRangeChange) {
      onRangeChange(newRange);
    }
  };

  const isInRange = (date: Date) => {
    if (selectedRange.start && selectedRange.end) {
      return date >= selectedRange.start && date <= selectedRange.end;
    }
    return false;
  };

  const getDateStatus = (date: Date) => {
    const dateString = date.toISOString().split("T")[0];
    const bookedDate = bookedDates.find((bd) => bd.date.split("T")[0] === dateString);
    return bookedDate?.status || null;
  };

  const isDateBooked = (date: Date) => {
    return getDateStatus(date) !== null;
  };

  const isInPreviewRange = (date: Date) => {
    // Show preview only when single day selected and hovering over different date
    if (
      selectedRange.start &&
      selectedRange.end &&
      selectedRange.start.getTime() === selectedRange.end.getTime() &&
      hoverDate &&
      !isDateBooked(date)
    ) {
      const selectedDate = selectedRange.start;
      const minDate = selectedDate < hoverDate ? selectedDate : hoverDate;
      const maxDate = selectedDate > hoverDate ? selectedDate : hoverDate;
      return date >= minDate && date <= maxDate && date.getTime() !== selectedDate.getTime();
    }
    return false;
  };

  const renderCalendar = (monthOffset: number) => {
    const month = addMonths(currentMonth, monthOffset);
    const {prevMonthDays, monthDays} = generateMonthDays(month);

    return (
      <div className="flex flex-col gap-10">
        <h2 className="mb-2 text-center text-sm font-semibold">{format(month, "MMMM yyyy")}</h2>
        <div className="grid grid-cols-7 gap-3 text-center text-gray-700">
          {["S", "M", "T", "W", "T", "F", "S"].map((day, index) => (
            <div key={index} className="font-semibold">
              {day}
            </div>
          ))}
          {prevMonthDays.map((_, i) => (
            <div key={i} className="text-gray-400">
              -
            </div>
          ))}
          {monthDays.map((day) => {
            const date = new Date(month.getFullYear(), month.getMonth(), day);
            const isSelected =
              (selectedRange.start && date.getTime() === selectedRange.start.getTime()) ||
              (selectedRange.end && date.getTime() === selectedRange.end.getTime());
            const dateStatus = getDateStatus(date);
            const isBooked = isDateBooked(date);

            let buttonClass =
              "flex size-7 items-center justify-center rounded-full text-sm transition-colors lg:size-10 ";

            if (isSelected) {
              buttonClass += "bg-[#80CBC4] text-white";
            } else if (dateStatus === "APPROVED") {
              buttonClass += "bg-green-200 text-green-800 cursor-not-allowed";
            } else if (dateStatus === "PENDING") {
              buttonClass += "bg-orange-200 text-orange-800 cursor-not-allowed";
            } else if (isInRange(date)) {
              buttonClass += "bg-border";
            } else if (isInPreviewRange(date)) {
              buttonClass += "bg-blue-50 border border-blue-200";
            } else {
              buttonClass += "hover:bg-border";
            }

            return (
              <button
                key={day}
                className={buttonClass}
                disabled={isBooked}
                onClick={(e: React.SyntheticEvent) => {
                  e.preventDefault();
                  if (!isBooked) {
                    handleDateClick(day, monthOffset);
                  }
                }}
                onMouseEnter={() => !isBooked && setHoverDate(date)}
                onMouseLeave={() => setHoverDate(null)}
              >
                {day}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div
      className="flex flex-col items-center rounded-md bg-white p-4 shadow-md"
      onMouseLeave={() => setHoverDate(null)}
    >
      <div className="relative top-[38px] mb-4 flex w-full justify-between">
        <button onClick={handlePrevMonth}>
          <ChevronLeft className="text-gray-600" />
        </button>
        <button onClick={handleNextMonth}>
          <ChevronRight className="text-gray-600" />
        </button>
      </div>
      <div className="flex w-full justify-between">
        {renderCalendar(0)}
        {renderCalendar(1)}
      </div>
    </div>
  );
};
