import React from "react";
import { Layout, PageLayout } from "@/components";
import { Inbox } from "react-feather"; // Feather icon

export function NoDataFound({ pageName }: { pageName: string }) {
  return (
    <Layout>
      <PageLayout pageName={pageName}>
        <div className="flex flex-col items-center justify-center text-center p-8 rounded-lg border border-border shadow-sm bg-background animate-appear">
          <Inbox className="w-12 h-12 text-secondary mb-4" /> {/* Icon */}
          <div className="text-textSecondary text-sm mb-2">
            No Data Available
          </div>
          <p className="text-md font-semiBold text-textPrimary">
            Looks like there&apos;s nothing here yet.
          </p>
          <p className="text-sm text-textSecondary mt-2">
            Please check back later or try refreshing.
          </p>
        </div>
      </PageLayout>
    </Layout>
  );
}

export function NoDataFoundComponent() {
  return (
    <div className="flex flex-col items-center justify-center text-center p-8 rounded-lg border border-border shadow-sm bg-background animate-appear">
      <Inbox className="w-12 h-12 text-secondary mb-4" /> {/* Icon */}
      <div className="text-textSecondary text-sm mb-2">No Data Available</div>
      <p className="text-md font-semiBold text-textPrimary">
        Looks like there&apos;s nothing here yet.
      </p>
      <p className="text-sm text-textSecondary mt-2">
        Please check back later or try refreshing.
      </p>
    </div>
  );
}
