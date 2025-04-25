import { Layout, PageLayout, PageSubHeading } from "@/components";
import React from "react";

export default function LeaveDetailsSkeleton() {
  return (
    <Layout>
      <PageLayout pageName="Leave Details">
        <div className="space-y-6 animate-pulse">
          <div>
            <div className="h-4 w-64 bg-muted rounded mb-2" />
            <div className="h-4 w-32 bg-muted rounded mb-1" />
            <div className="h-3 w-80 bg-muted rounded" />
          </div>

          <div>
            <PageSubHeading heading="Leave Days" />
            <ul className="space-y-2 mt-2 ml-4">
              {[...Array(3)].map((_, i) => (
                <li key={i} className="h-4 w-72 bg-muted rounded" />
              ))}
            </ul>
          </div>

          <div>
            <PageSubHeading heading="Documents" />
            <div className="grid grid-cols-2 gap-4 mt-2">
              {[...Array(2)].map((_, i) => (
                <div
                  key={i}
                  className="border border-border rounded-md p-2 space-y-2"
                >
                  <div className="w-full h-48 bg-muted rounded" />
                  <div className="h-3 w-20 bg-muted rounded" />
                </div>
              ))}
            </div>
          </div>

          <hr className="border-t border-border" />

          <div className="flex justify-end gap-2 w-full">
            <div className="flex gap-5 max-w-[200px]">
              <div className="h-10 w-20 bg-muted rounded" />
              <div className="h-10 w-20 bg-muted rounded" />
            </div>
          </div>
        </div>
      </PageLayout>
    </Layout>
  );
}
