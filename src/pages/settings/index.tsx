import {Layout, PageLayout, Tabs} from "@/components";
import React from "react";
import {LocationSettings} from "@/views/settings/locationSettings/locationSettings";
import {LeaveSettings} from "@/views/settings/leaveSettings/leaveSettings";
import {OrganizationSettings} from "@/views/settings/organizationSettings/organizationSettings";

export default function Settings() {
  return (
    <Layout>
      <PageLayout pageName="Organization settings">
        <Tabs
          tabs={[
            {label: "Organization Settings", content: <OrganizationSettings />},
            {label: "Leave Settings", content: <LeaveSettings />},
            {label: "Location Settings", content: <LocationSettings />},
          ]}
        />
      </PageLayout>
    </Layout>
  );
}
