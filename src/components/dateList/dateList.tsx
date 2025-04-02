import React, { useEffect, useState } from "react";

interface DateRange {
  start: Date | null;
  end: Date | null;
}

interface DateListProps {
  selectedRange: DateRange;
  onDateSelect: (dates: { date: Date; half: "AM" | "PM" | null }[]) => void;
}

export const DateList: React.FC<DateListProps> = ({
  selectedRange,
  onDateSelect,
}) => {
  const [dateList, setDateList] = useState<
    { date: Date; half: "AM" | "PM" | null }[]
  >([]);

  useEffect(() => {
    if (selectedRange.start && selectedRange.end) {
      const startDate = new Date(selectedRange.start);
      const endDate = new Date(selectedRange.end);
      const currentDate = new Date(startDate);
      const dates: { date: Date; half: "AM" | "PM" | null }[] = [];

      while (currentDate <= endDate) {
        dates.push({ date: new Date(currentDate), half: null });
        currentDate.setDate(currentDate.getDate() + 1);
      }

      setDateList(dates);
      onDateSelect(dates);
    } else {
      setDateList([]);
      onDateSelect([]);
    }
  }, [selectedRange, onDateSelect]);

  const handleCheckboxChange = (index: number, half: "AM" | "PM") => {
    const updatedList = dateList.map((item, i) =>
      i === index ? { ...item, half: item.half === half ? null : half } : item
    );
    setDateList(updatedList);
    onDateSelect(updatedList);
  };

  return (
    <div className="flex flex-col gap-5 animate-appear">
      <h3 className="font-semibold text-lg">Half Days</h3>
      <ul className="flex flex-col gap-2">
        {dateList.map((item, index) => (
          <li key={index} className="flex gap-2">
            <div className="w-[150px]">{item.date.toDateString()}</div>
            <div className="flex items-center gap-2">
              <input
                className="cursor-pointer accent-primary h-4 w-4 "
                type="checkbox"
                checked={item.half === "AM"}
                onChange={() => handleCheckboxChange(index, "AM")}
              />
              <p>(AM)</p>
            </div>
            <div className="flex items-center gap-2 ">
              <input
                className="cursor-pointer accent-primary  h-4 w-4 "
                type="checkbox"
                checked={item.half === "PM"}
                onChange={() => handleCheckboxChange(index, "PM")}
              />{" "}
              <p>(PM)</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};
