import React from "react";

export const EmploymentTypesShimmer: React.FC = () => {
  return (
    <div className="flex flex-col">
      {Array.from({length: 3}).map((_, index) => (
        <div key={index} className="flex animate-pulse justify-between border-t border-border py-3">
          <div className="flex-1">
            <div className="mb-3 flex items-center gap-3">
              <div className="h-4 w-32 rounded bg-gray-200"></div>
              <div className="h-6 w-16 rounded-full bg-gray-200"></div>
            </div>
            <div className="flex items-center gap-2">
              <div className="size-4 rounded bg-gray-200"></div>
              <div className="h-3 w-24 rounded bg-gray-200"></div>
            </div>
          </div>
          <div className="text-sm">
            <div className="size-8 rounded bg-gray-200"></div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default EmploymentTypesShimmer;
