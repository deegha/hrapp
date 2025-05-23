import { PageSubHeading } from "@/components";
import React from "react";

export default function LeaveDetailsSkeleton() {
  return (
    <div>
      <div>
        <div className="space-y-6 animate-pulse">
          <h1 className="text-[32px] font-semibold uppercase">
            Leave Request Details
          </h1>
          <div>
            <div className="h-4 w-64 bg-border rounded mb-2" />
            <div className="h-4 w-32 bg-border rounded mb-2" />
            <div className="h-3 w-80 bg-border rounded mb-2" />
          </div>

          <div>
            <PageSubHeading heading="Leave Days" />
            <ul className="flex flex-col gap-2 mt-2">
              {[...Array(3)].map((_, i) => (
                <li key={i} className="h-4 w-72 bg-border rounded" />
              ))}
            </ul>
          </div>

          <div>
            <PageSubHeading heading="Documents" />
            <div className="flex flex-col gap-4 mt-2">
              {[...Array(2)].map((_, i) => (
                <div
                  key={i}
                  className="border border-border rounded-md p-2 space-y-2"
                >
                  <div className="w-full h-[20px] bg-border rounded" />
                  <div className="h-3 w-20 bg-border rounded" />
                </div>
              ))}
            </div>
          </div>

          <hr className="border-t border-border" />

          <div className="flex justify-end gap-2 w-full">
            <div className="flex gap-5 max-w-[200px]">
              <div className="h-10 w-20 bg-border rounded" />
              <div className="h-10 w-20 bg-border rounded" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
