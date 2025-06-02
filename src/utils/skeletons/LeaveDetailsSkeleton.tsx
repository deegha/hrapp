import {PageSubHeading} from "@/components";
import React from "react";

export default function LeaveDetailsSkeleton() {
  return (
    <div>
      <div>
        <div className="animate-pulse space-y-6">
          <h1 className="text-[32px] font-semibold uppercase">Leave Request Details</h1>
          <div>
            <div className="mb-2 h-4 w-64 rounded bg-border" />
            <div className="mb-2 h-4 w-32 rounded bg-border" />
            <div className="mb-2 h-3 w-80 rounded bg-border" />
          </div>

          <div>
            <PageSubHeading heading="Leave Days" />
            <ul className="mt-2 flex flex-col gap-2">
              {[...Array(3)].map((_, i) => (
                <li key={i} className="h-4 w-72 rounded bg-border" />
              ))}
            </ul>
          </div>

          <div>
            <PageSubHeading heading="Documents" />
            <div className="mt-2 flex flex-col gap-4">
              {[...Array(2)].map((_, i) => (
                <div key={i} className="space-y-2 rounded-md border border-border p-2">
                  <div className="h-[20px] w-full rounded bg-border" />
                  <div className="h-3 w-20 rounded bg-border" />
                </div>
              ))}
            </div>
          </div>

          <hr className="border-t border-border" />

          <div className="flex w-full justify-end gap-2">
            <div className="flex max-w-[200px] gap-5">
              <div className="h-10 w-20 rounded bg-border" />
              <div className="h-10 w-20 rounded bg-border" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
