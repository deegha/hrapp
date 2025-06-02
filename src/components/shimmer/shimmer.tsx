import React from "react";

export const Shimmer: React.FC = () => {
  return (
    <div className="size-full animate-pulse bg-gray-200">
      <div className="mb-4 h-4 w-3/4 rounded bg-gray-300"></div>
      <div className="h-4 w-1/2 rounded bg-gray-300"></div>
    </div>
  );
};

export default Shimmer;
