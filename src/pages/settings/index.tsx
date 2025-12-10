import {Layout, PageLayout, Tabs} from "@/components";
import dynamic from "next/dynamic";
import React, {useState, useCallback} from "react";

const DynamicGoogleTargetLocationSetter = dynamic(
  () => import("@/views/settings/locationSettings"),
  {
    ssr: false,
    loading: () => (
      <div className="p-8 text-center">
        <p className="text-lg font-semibold text-gray-700">Loading map...</p>
        <p className="text-sm text-gray-500">Waiting for Google Maps API to load.</p>
      </div>
    ),
  },
);

export default function Settings() {
  return (
    <Layout>
      <PageLayout pageName="Organization settings">
        <Tabs
          tabs={[
            {label: "Location Settings", content: <DynamicGoogleTargetLocationSetter />},
            {label: "Employment Types", content: <div>second</div>},
          ]}
        />
      </PageLayout>
    </Layout>
  );
}
