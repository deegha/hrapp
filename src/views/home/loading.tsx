import React from "react";

const Pulse = ({className = ""}) => (
  <div className={`animate-pulse rounded bg-gray-200 ${className}`} />
);

const LeaveBalanceSkeleton: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Description line */}
      <Pulse className="h-4 w-96 max-w-full" />

      {/* Leave Balance card */}
      <div className="rounded-lg border border-border bg-white p-6 shadow-sm">
        <Pulse className="mb-4 h-3 w-32" />
        <Pulse className="mb-3 h-5 w-48" />
        <div className="flex gap-6">
          <div className="flex flex-col gap-1.5">
            <Pulse className="h-3 w-8" />
            <Pulse className="h-4 w-5" />
          </div>
          <div className="flex flex-col gap-1.5">
            <Pulse className="h-3 w-8" />
            <Pulse className="h-4 w-5" />
          </div>
          <div className="flex flex-col gap-1.5">
            <Pulse className="h-3 w-16" />
            <Pulse className="h-4 w-5" />
          </div>
        </div>
      </div>

      {/* My Upcoming Leaves card */}
      <div className="rounded-lg border border-border bg-white p-6 shadow-sm">
        <Pulse className="mb-4 h-3 w-36" />
        <div className="flex flex-col gap-3">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="flex items-center justify-between rounded-md border border-gray-100 p-4"
            >
              <div className="flex flex-1 flex-col gap-2">
                <Pulse className="h-4 w-52" />
                <Pulse className="h-3 w-20" />
              </div>
              <Pulse className="h-6 w-24 rounded-full" />
            </div>
          ))}
        </div>
      </div>

      {/* Pending Approvals card */}
      <div className="rounded-lg border border-border bg-white p-6 shadow-sm">
        <Pulse className="mb-4 h-3 w-36" />
        <div className="flex items-center justify-between rounded-md border border-gray-100 p-4">
          <div className="flex flex-1 flex-col gap-2">
            <Pulse className="h-4 w-44" />
            <Pulse className="h-3 w-52" />
          </div>
          <Pulse className="h-6 w-8 rounded-full" />
        </div>
      </div>

      {/* Company Leaves card */}
      <div className="rounded-lg border border-border bg-white p-6 shadow-sm">
        <Pulse className="mb-4 h-3 w-64" />
        <div className="flex flex-col gap-3">
          {[0, 1].map((i) => (
            <div
              key={i}
              className="flex items-center justify-between rounded-md border border-gray-100 p-4"
            >
              <div className="flex flex-1 flex-col gap-2">
                <Pulse className="h-4 w-36" />
                <Pulse className="h-3 w-52" />
                <Pulse className="h-3 w-16" />
              </div>
              <Pulse className="h-6 w-24 rounded-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LeaveBalanceSkeleton;
