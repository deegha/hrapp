import {Layout, PageLayout, Tabs} from "@/components";
import React from "react";
import {LocationSettings} from "@/views/settings/locationSettings/locationSettings";
import {LeaveSettings} from "@/views/settings/leaveSettings/leaveSettings";

export default function Settings() {
  return (
    <Layout>
      <PageLayout pageName="Organization settings">
        <Tabs
          tabs={[
            {label: "Location Settings", content: <LocationSettings />},
            {label: "Leave Settings", content: <LeaveSettings />},
          ]}
        />
      </PageLayout>
    </Layout>
  );
}
