import moment from "moment";

// Generates a list of the last 24 months dynamically
const generateMonthOptions = () => {
  const options = [];
  const start = moment(); // Current date (January 2026)

  for (let i = 0; i < 24; i++) {
    const month = moment(start).subtract(i, "months");
    options.push({
      id: month.format("YYYY-MM"), // e.g., "2026-01"
      label: month.format("MMMM YYYY"), // e.g., "January 2026"
    });
  }
  return options;
};

export const monthOptions = generateMonthOptions();
