import {Button, Layout, PageLayout, NoDataFoundComponent, Pagination, Drawer} from "@/components";
import {Users, UserDetails} from "@/views";
import {useRouter} from "next/router";
import {fetchUsers} from "@/services";
import {fetchMyPermissions} from "@/services/userService";
import useSWR from "swr";
import {usePagination} from "@/hooks/usePagination";
import {useUserStore} from "@/store/useUserStore";
import {useEffect} from "react";

export default function UserManagement() {
  const {activePage} = usePagination();
  const {user, unsetUser} = useUserStore();
  const router = useRouter();
  const {data: users} = useSWR(`fetch-users${activePage}`, () =>
    fetchUsers({page: parseInt(activePage), limit: 10}),
  );
  const {data: userPermissionData} = useSWR("my-permissions", fetchMyPermissions);

  useEffect(() => unsetUser, [unsetUser]);

  function handleCreateUser() {
    router.push("./user-management/create-user");
  }

  const userPermission = userPermissionData?.data?.permission;
  const canCreateUser = userPermission === "ADMIN_USER" || userPermission === "SUPER_USER";

  return (
    <Layout>
      <Drawer open={user?.employeeId ? true : false} close={unsetUser}>
        <UserDetails />
      </Drawer>
      <PageLayout
        actionButton={
          canCreateUser ? <Button onClick={handleCreateUser}>CREATE USER</Button> : undefined
        }
        pageName="User Management"
      >
        {users?.data.data.length === 0 ? (
          <NoDataFoundComponent />
        ) : (
          <div className="flex flex-col gap-5">
            {users && <Users users={users?.data?.data} />}
            {users && users.data.totalPages > 1 && (
              <Pagination numberOfPage={users.data.totalPages} />
            )}
          </div>
        )}
      </PageLayout>
    </Layout>
  );
}
