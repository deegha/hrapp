import {AdminLayout, PageLayout, NoDataFoundComponent} from "@/components";
import {OrganizationsList} from "@/views/admin";
import {fetchAdminOrganizations} from "@/services/adminService";
import useSWR from "swr";

export default function AdminDashboard() {
  const {data, isLoading} = useSWR("admin-organizations", fetchAdminOrganizations);

  return (
    <AdminLayout>
      <PageLayout pageName="Organizations">
        {isLoading ? (
          <div className="flex flex-col gap-3">
            {Array.from({length: 5}).map((_, i) => (
              <div
                key={i}
                className="flex h-[52px] animate-pulse flex-col gap-1 border-t border-border py-3"
              >
                <div className="h-3 w-48 rounded bg-gray-200" />
                <div className="h-3 w-24 rounded bg-gray-100" />
              </div>
            ))}
          </div>
        ) : !data?.data?.length ? (
          <NoDataFoundComponent />
        ) : (
          <OrganizationsList organizations={data.data} />
        )}
      </PageLayout>
    </AdminLayout>
  );
}
