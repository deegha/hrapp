import React, {useState} from "react";
import {format, addMonths, subMonths} from "date-fns";
import {ChevronLeft, ChevronRight} from "react-feather";

interface ISingleDatePickerProps {
  onDateChange?: (date: Date | null) => void;
  selectedDate?: Date | null;
}

export const SingleDatePicker: React.FC<ISingleDatePickerProps> = ({
  onDateChange,
  selectedDate = null,
}) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());

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

  const handleDateClick = (day: number) => {
    const clickedDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);

    if (onDateChange) {
      onDateChange(clickedDate);
    }
  };

  const {prevMonthDays, monthDays} = generateMonthDays(currentMonth);

  return (
    <div className="flex w-[280px] flex-col items-center rounded-md bg-white p-3 shadow-md">
      <div className="relative top-[25px] mb-3 flex w-full justify-between px-2">
        <button onClick={handlePrevMonth}>
          <ChevronLeft className="text-gray-600" size={16} />
        </button>
        <button onClick={handleNextMonth}>
          <ChevronRight className="text-gray-600" size={16} />
        </button>
      </div>

      <div className="flex flex-col gap-6">
        <h2 className="mb-1 text-center text-sm font-semibold">
          {format(currentMonth, "MMMM yyyy")}
        </h2>
        <div className="grid grid-cols-7 gap-2 text-center text-gray-700">
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
            const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
            const isSelected = selectedDate && date.getTime() === selectedDate.getTime();
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const isPastDate = date.getTime() < today.getTime();

            let buttonClass =
              "flex size-8 items-center justify-center rounded-full text-sm transition-colors ";

            if (isPastDate) {
              buttonClass += "text-gray-300 cursor-not-allowed";
            } else if (isSelected) {
              buttonClass += "bg-[#80CBC4] text-white";
            } else {
              buttonClass += "hover:bg-border";
            }

            return (
              <button
                key={day}
                className={buttonClass}
                disabled={isPastDate}
                onClick={(e: React.SyntheticEvent) => {
                  e.preventDefault();
                  if (!isPastDate) {
                    handleDateClick(day);
                  }
                }}
              >
                {day}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
