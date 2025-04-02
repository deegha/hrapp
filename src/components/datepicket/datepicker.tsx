import React, { useState } from "react";
import { format, addMonths, subMonths } from "date-fns";
import { ChevronLeft, ChevronRight } from "react-feather";

interface IDatePickerProps {
  onRangeChange?: (range: { start: Date | null; end: Date | null }) => void;
}

export const DatePicker: React.FC<IDatePickerProps> = ({ onRangeChange }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedRange, setSelectedRange] = useState<{
    start: Date | null;
    end: Date | null;
  }>({ start: null, end: null });

  const generateMonthDays = (month: Date) => {
    const startOfMonth = new Date(month.getFullYear(), month.getMonth(), 1);
    const daysInMonth = new Date(
      month.getFullYear(),
      month.getMonth() + 1,
      0
    ).getDate();
    const startDay = startOfMonth.getDay();
    const prevMonthDays = Array.from({ length: startDay }, (_, i) => i);
    const monthDays = Array.from({ length: daysInMonth }, (_, i) => i + 1);
    return { prevMonthDays, monthDays };
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
      day
    );

    let newRange;
    if (!selectedRange.start || (selectedRange.start && selectedRange.end)) {
      newRange = { start: selectedDate, end: null };
    } else {
      newRange = { start: selectedRange.start, end: selectedDate };
    }

    setSelectedRange(newRange);

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

  const renderCalendar = (monthOffset: number) => {
    const month = addMonths(currentMonth, monthOffset);
    const { prevMonthDays, monthDays } = generateMonthDays(month);

    return (
      <div className="">
        <h2 className="text-lg font-semibold text-center mb-2">
          {format(month, "MMMM yyyy")}
        </h2>
        <div className="grid grid-cols-7 gap-4 text-center text-gray-700">
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
              (selectedRange.start &&
                date.getTime() === selectedRange.start.getTime()) ||
              (selectedRange.end &&
                date.getTime() === selectedRange.end.getTime());
            return (
              <button
                key={day}
                className={`w-8 h-8 flex items-center justify-center rounded-full transition-colors ${
                  isSelected
                    ? "bg-[#80CBC4] text-white"
                    : isInRange(date)
                      ? "bg-gray-200"
                      : "hover:bg-gray-200"
                }`}
                onClick={(e: React.SyntheticEvent) => {
                  e.preventDefault();
                  handleDateClick(day, monthOffset);
                }}
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
    <div className="mx-auto bg-white rounded-lg shadow-md p-4 flex flex-col items-center">
      <div className="flex justify-between w-full mb-4 relative top-[48px]">
        <button onClick={handlePrevMonth}>
          <ChevronLeft className="text-gray-600" />
        </button>
        <button onClick={handleNextMonth}>
          <ChevronRight className="text-gray-600" />
        </button>
      </div>
      <div className="flex gap-10 w-full">
        {renderCalendar(0)}
        {renderCalendar(1)}
      </div>
    </div>
  );
};
