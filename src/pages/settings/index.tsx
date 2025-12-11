import {Layout, PageLayout, Tabs} from "@/components";
import React from "react";
import {LocationSettings} from "@/views/settings/locationSettings/locationSettings";

export default function Settings() {
  return (
    <Layout>
      <PageLayout pageName="Organization settings">
        <Tabs
          tabs={[
            {label: "Location Settings", content: <LocationSettings />},
            {label: "Employment Types", content: <div>second</div>},
          ]}
        />
      </PageLayout>
    </Layout>
  );
}
