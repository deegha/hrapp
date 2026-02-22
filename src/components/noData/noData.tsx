import React from "react";
import {Layout, PageLayout} from "@/components";
import {Inbox} from "react-feather"; // Feather icon

export function NoDataFound({pageName}: {pageName: string}) {
  return (
    <Layout>
      <PageLayout pageName={pageName}>
        <div className="flex animate-appear flex-col items-center justify-center rounded-md border border-border bg-background p-8 text-center shadow-sm">
          <Inbox className="mb-4 size-12 text-secondary" /> {/* Icon */}
          <div className="mb-2 text-sm text-textSecondary">No Data Available</div>
          <p className="text-md font-semiBold text-textPrimary">
            Looks like there&apos;s nothing here yet.
          </p>
          <p className="mt-2 text-sm text-textSecondary">
            Please check back later or try refreshing.
          </p>
        </div>
      </PageLayout>
    </Layout>
  );
}

export function NoDataFoundComponent() {
  return (
    <div className="flex animate-appear flex-col items-center justify-center rounded-md border border-border bg-background p-8 text-center shadow-sm">
      <Inbox className="mb-4 size-12 text-secondary" /> {/* Icon */}
      <div className="mb-2 text-sm text-textSecondary">No Data Available</div>
      <p className="text-md font-semiBold text-textPrimary">
        Looks like there&apos;s nothing here yet.
      </p>
      <p className="mt-2 text-sm text-textSecondary">Please check back later or try refreshing.</p>
    </div>
  );
}
