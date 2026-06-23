import {AdminLayout, PageLayout, NoDataFoundComponent} from "@/components";
import {OrganizationUsers} from "@/views/admin";
import {
  fetchAdminOrganizationUsers,
  updateAdminOrgFeatures,
  TOrgFeatures,
} from "@/services/adminService";
import {useRouter} from "next/router";
import useSWR, {mutate} from "swr";
import {useState} from "react";

type FeatureKey = keyof TOrgFeatures;

const FEATURES: {key: FeatureKey; label: string; description: string}[] = [
  {
    key: "isAttendanceEnabled",
    label: "Attendance Tracking",
    description: "Employees can clock in/out. Working days are calculated from attendance records.",
  },
  {
    key: "isGeofenceRequired",
    label: "Geofence Required",
    description: "Clock-in is only allowed from within a defined geographic boundary.",
  },
  {
    key: "isQrCodeCheckEnabled",
    label: "QR Code Check-In",
    description: "Employees must scan a QR code to mark attendance.",
  },
  {
    key: "isSelfieVerificationEnabled",
    label: "Selfie Verification",
    description: "A selfie is required when clocking in or out.",
  },
  {
    key: "isAdvanceLeaveEnabled",
    label: "Advance Leave Requests",
    description: "Employees can apply for leave in advance beyond the standard limit.",
  },
  {
    key: "isTimeOffRequestsEnabled",
    label: "Time-Off Requests",
    description: "Employees can submit time-off / WFH requests.",
  },
];

function FeatureToggle({
  label,
  description,
  enabled,
  loading,
  onToggle,
}: {
  label: string;
  description: string;
  enabled: boolean;
  loading: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-4">
      <div className="min-w-0">
        <p className="text-sm font-medium text-textPrimary">{label}</p>
        <p className="mt-0.5 text-xs text-textSecondary">{description}</p>
      </div>
      <button
        onClick={onToggle}
        disabled={loading}
        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors focus:outline-none disabled:opacity-50 ${
          enabled ? "bg-primary" : "bg-gray-200"
        }`}
      >
        <span
          className={`inline-block size-4 rounded-full bg-white shadow transition-transform${
            enabled ? "translate-x-6" : "translate-x-1"
          }`}
        />
      </button>
    </div>
  );
}

export default function OrganizationDetail() {
  const router = useRouter();
  const orgId = parseInt(router.query.id as string);
  const swrKey = orgId ? `admin-org-users-${orgId}` : null;

  const {data, isLoading} = useSWR(swrKey, () => fetchAdminOrganizationUsers(orgId));
  const [savingKey, setSavingKey] = useState<FeatureKey | null>(null);

  const orgName = data?.data?.organization?.organizationName ?? "Organization";
  const features = data?.data?.features;

  const handleToggle = async (key: FeatureKey) => {
    if (!features || savingKey) return;
    const newValue = !features[key];
    setSavingKey(key);
    try {
      await updateAdminOrgFeatures(orgId, {[key]: newValue});
      await mutate(swrKey);
    } finally {
      setSavingKey(null);
    }
  };

  return (
    <AdminLayout>
      <PageLayout
        pageName={orgName}
        breadcrumbFilter={(segments) => {
          const idx = segments.indexOf("admin-panel");
          return idx !== -1 ? segments.slice(idx) : segments;
        }}
      >
        {isLoading ? (
          <div className="flex flex-col gap-3">
            {Array.from({length: 8}).map((_, i) => (
              <div
                key={i}
                className="flex h-[52px] animate-pulse flex-col gap-1 border-t border-border py-3"
              >
                <div className="h-3 w-48 rounded bg-gray-200" />
                <div className="h-3 w-64 rounded bg-gray-100" />
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-8">
            {/* Feature toggles */}
            <div className="rounded-2xl border border-border bg-white shadow-sm">
              <div className="border-b border-border px-5 py-4">
                <h2 className="text-sm font-semibold text-textPrimary">Organization Features</h2>
                <p className="mt-0.5 text-xs text-textSecondary">
                  Enable or disable features for this organization.
                </p>
              </div>
              <div className="divide-y divide-border px-5">
                {features &&
                  FEATURES.map((f) => (
                    <FeatureToggle
                      key={f.key}
                      label={f.label}
                      description={f.description}
                      enabled={features[f.key]}
                      loading={savingKey === f.key}
                      onToggle={() => handleToggle(f.key)}
                    />
                  ))}
              </div>
            </div>

            {/* Users */}
            <div>
              <h2 className="mb-3 text-sm font-semibold text-textPrimary">
                Users ({data?.data?.users?.length ?? 0})
              </h2>
              {!data?.data?.users?.length ? (
                <NoDataFoundComponent />
              ) : (
                <OrganizationUsers users={data.data.users} />
              )}
            </div>
          </div>
        )}
      </PageLayout>
    </AdminLayout>
  );
}
