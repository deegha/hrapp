import {AdminLayout, PageLayout, NoDataFoundComponent} from "@/components";
import {OrganizationUsers} from "@/views/admin";
import {
  fetchAdminOrganizationUsers,
  fetchAdminOrgFeatures,
  updateAdminOrgFeatures,
  TOrgFeatures,
} from "@/services/adminService";
import {useRouter} from "next/router";
import useSWR from "swr";
import {useState} from "react";

type FeatureKey = keyof TOrgFeatures;

const FEATURE_LABELS: {key: FeatureKey; label: string; description: string}[] = [
  {
    key: "isAttendanceEnabled",
    label: "Attendance",
    description: "Enable clock-in/clock-out attendance tracking",
  },
  {
    key: "isGeofenceRequired",
    label: "Geofence",
    description: "Restrict attendance to approved locations",
  },
  {
    key: "isQrCodeCheckEnabled",
    label: "QR Code Check-in",
    description: "Allow QR code based check-in",
  },
  {
    key: "isSelfieVerificationEnabled",
    label: "Selfie Verification",
    description: "Require selfie on check-in",
  },
  {
    key: "isAdvanceLeaveEnabled",
    label: "Advance Leave",
    description: "Allow employees to apply for advance leave",
  },
  {
    key: "isTimeOffRequestsEnabled",
    label: "Time-Off Requests",
    description: "Enable time-off / WFH requests",
  },
];

export default function OrganizationDetail() {
  const router = useRouter();
  const orgId = parseInt(router.query.id as string);
  const [saving, setSaving] = useState<FeatureKey | null>(null);

  const {data: usersData, isLoading: usersLoading} = useSWR(
    orgId ? `admin-org-users-${orgId}` : null,
    () => fetchAdminOrganizationUsers(orgId),
  );

  const {data: featuresData, mutate: mutateFeatures} = useSWR(
    orgId ? `admin-org-features-${orgId}` : null,
    () => fetchAdminOrgFeatures(orgId),
  );

  const features = featuresData?.data?.features;
  const orgName = usersData?.data?.organization?.organizationName ?? "Organization";

  async function handleToggle(key: FeatureKey) {
    if (!features || saving) return;
    setSaving(key);
    try {
      await updateAdminOrgFeatures(orgId, {[key]: !features[key]});
      await mutateFeatures();
    } finally {
      setSaving(null);
    }
  }

  return (
    <AdminLayout>
      <PageLayout
        pageName={orgName}
        breadcrumbFilter={(segments) => {
          const idx = segments.indexOf("admin-panel");
          return idx !== -1 ? segments.slice(idx) : segments;
        }}
      >
        <div className="flex flex-col gap-8">
          <div className="rounded-lg border border-border p-5">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-gray-500">
              Features
            </h2>
            <div className="flex flex-col divide-y divide-border">
              {FEATURE_LABELS.map(({key, label, description}) => (
                <div key={key} className="flex items-center justify-between py-3">
                  <div>
                    <p className="text-sm font-medium">{label}</p>
                    <p className="text-xs text-gray-500">{description}</p>
                  </div>
                  <button
                    onClick={() => handleToggle(key)}
                    disabled={saving === key || !features}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none disabled:opacity-50 ${
                      features?.[key] ? "bg-primary" : "bg-gray-200"
                    }`}
                  >
                    <span
                      className={`inline-block size-4 rounded-full bg-white shadow transition-transform${
                        features?.[key] ? "translate-x-6" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-gray-500">
              Users ({usersData?.data?.users?.length ?? 0})
            </h2>
            {usersLoading ? (
              <div className="flex flex-col gap-3">
                {Array.from({length: 6}).map((_, i) => (
                  <div
                    key={i}
                    className="flex h-[52px] animate-pulse flex-col gap-1 border-t border-border py-3"
                  >
                    <div className="h-3 w-48 rounded bg-gray-200" />
                    <div className="h-3 w-64 rounded bg-gray-100" />
                  </div>
                ))}
              </div>
            ) : !usersData?.data?.users?.length ? (
              <NoDataFoundComponent />
            ) : (
              <OrganizationUsers users={usersData.data.users} />
            )}
          </div>
        </div>
      </PageLayout>
    </AdminLayout>
  );
}
