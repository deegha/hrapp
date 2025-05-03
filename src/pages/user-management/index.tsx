import {
  Button,
  Layout,
  PageLayout,
  NoDataFoundComponent,
  NoDataFound,
  Pagination,
} from "@/components";
import { Users } from "@/views";
import { useRouter } from "next/router";
import { fetchUsers } from "@/services";
import useSWR from "swr";
import { usePagination } from "@/hooks/usePagination";
export default function UserManagement() {
  const { activePage } = usePagination();
  const router = useRouter();
  const { data: users } = useSWR(`fetch-users${activePage}`, () =>
    fetchUsers({ page: parseInt(activePage), limit: 10 })
  );

  if (users?.error || !users?.data) {
    return <div>Some error</div>;
  }

  function handleApplyLeave() {
    router.push("./user-management/create-user");
  }

  if (users.data.data.length === 0)
    return <NoDataFound pageName="User Management" />;

  return (
    <Layout>
      <PageLayout
        actionButton={<Button onClick={handleApplyLeave}>CREATE USER</Button>}
        pageName="User Management"
      >
        {users?.data.data.length === 0 ? (
          <NoDataFoundComponent />
        ) : (
          <div className="flex flex-col gap-5">
            <Users users={users?.data.data} />
            {users.data.totalPages > 1 && (
              <Pagination numberOfPage={users.data.totalPages} />
            )}
          </div>
        )}
      </PageLayout>
    </Layout>
  );
}
