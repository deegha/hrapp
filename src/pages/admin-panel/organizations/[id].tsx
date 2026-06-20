import {AdminLayout, PageLayout, NoDataFoundComponent} from "@/components";
import {OrganizationUsers} from "@/views/admin";
import {fetchAdminOrganizationUsers} from "@/services/adminService";
import {useRouter} from "next/router";
import useSWR from "swr";

export default function OrganizationDetail() {
  const router = useRouter();
  const orgId = parseInt(router.query.id as string);

  const {data, isLoading} = useSWR(orgId ? `admin-org-users-${orgId}` : null, () =>
    fetchAdminOrganizationUsers(orgId),
  );

  const orgName = data?.data?.organization?.organizationName ?? "Organization";

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
        ) : !data?.data?.users?.length ? (
          <NoDataFoundComponent />
        ) : (
          <OrganizationUsers users={data.data.users} />
        )}
      </PageLayout>
    </AdminLayout>
  );
}
