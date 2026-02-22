import React from "react";

export const Shimmer: React.FC = () => {
  const fields = ["Name", "Email", "User Level", "Status", "Employee ID", "Joined At"];

  return (
    <div className="space-y-6 p-6">
      <h2 className="h-6 w-48 animate-pulse rounded bg-gray-300"></h2>
      <div className="space-y-4">
        {fields.map((field, index) => (
          <div key={index} className="flex items-center space-x-4">
            <div className="h-4 w-32 animate-pulse rounded bg-gray-200"></div>
            <div className="h-4 flex-1 animate-pulse rounded bg-gray-300"></div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Shimmer;
