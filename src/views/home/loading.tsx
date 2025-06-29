// components/LeaveBalanceSkeleton.tsx
import React from "react";

const SkeletonBox = ({className = ""}) => (
  <div className={`animate-pulse rounded bg-gray-200 ${className}`} />
);

const LeaveBalanceSkeleton: React.FC = () => {
  return (
    <div className="space-y-6 p-6">
      {/* Header Description */}
      <SkeletonBox className="h-4 w-1/2" />

      {/* Leave Balance Section */}
      <div className="space-y-4 rounded-lg border p-4">
        <SkeletonBox className="h-6 w-1/3" />
        <div className="flex flex-col gap-2 space-x-6">
          <SkeletonBox className="h-4 w-12" />
          <SkeletonBox className="h-4 w-12" />
          <SkeletonBox className="h-4 w-12" />
        </div>
      </div>

      {/* Upcoming Leaves */}
      <div className="space-y-4">
        <SkeletonBox className="h-5 w-1/4" />
        {[1, 2, 3].map((_, idx) => (
          <div key={idx} className="flex flex-col gap-2 space-y-2 rounded-lg border p-4">
            <SkeletonBox className="h-4 w-1/3" />
            <SkeletonBox className="h-4 w-1/4" />
            <SkeletonBox className="ml-auto h-6 w-20" />
          </div>
        ))}
      </div>

      {/* Pending Approvals */}
      <div className="space-y-4">
        <SkeletonBox className="h-5 w-1/4" />
        <div className="flex flex-col gap-2 rounded-lg border p-4">
          <SkeletonBox className="h-4 w-1/2" />
          <SkeletonBox className="h-4 w-1/2" />
        </div>
      </div>
    </div>
  );
};

export default LeaveBalanceSkeleton;
