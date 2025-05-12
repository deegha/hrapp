import React from "react";

export const Shimmer: React.FC = () => {
  return (
    <div className="animate-pulse bg-gray-200 w-full h-full">
      <div className="h-4 bg-gray-300 rounded w-3/4 mb-4"></div>
      <div className="h-4 bg-gray-300 rounded w-1/2"></div>
    </div>
  );
};

export default Shimmer;
