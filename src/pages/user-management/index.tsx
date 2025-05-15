import {
  Button,
  Layout,
  PageLayout,
  NoDataFoundComponent,
  Pagination,
  Drawer,
} from "@/components";
import { Users, UserDetails } from "@/views";
import { useRouter } from "next/router";
import { fetchUsers } from "@/services";
import useSWR from "swr";
import { usePagination } from "@/hooks/usePagination";
import { useUserStore } from "@/store/useUserStore";
import { useEffect } from "react";

export default function UserManagement() {
  const { activePage } = usePagination();
  const { user, unsetUser } = useUserStore();
  const router = useRouter();
  const { data: users } = useSWR(`fetch-users${activePage}`, () =>
    fetchUsers({ page: parseInt(activePage), limit: 10 })
  );

  useEffect(() => unsetUser, [unsetUser]);

  if (users?.error || !users?.data) {
    return <div>Some error</div>;
  }

  function handleApplyLeave() {
    router.push("./user-management/create-user");
  }

  return (
    <Layout>
      <Drawer open={user?.employeeId ? true : false} close={unsetUser}>
        <UserDetails />
      </Drawer>
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
