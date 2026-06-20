import {useState} from "react";
import {AdminLayout, PageLayout, Button, Drawer, NoDataFoundComponent} from "@/components";
import {InternalUsersList, InternalUserForm} from "@/views/admin";
import {fetchInternalUsers, TInternalUser} from "@/services/adminService";
import useSWR from "swr";

export default function AdminUsers() {
  const {data, isLoading} = useSWR("admin-internal-users", fetchInternalUsers);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<TInternalUser | null>(null);

  const openCreate = () => {
    setSelectedUser(null);
    setDrawerOpen(true);
  };

  const openEdit = (user: TInternalUser) => {
    setSelectedUser(user);
    setDrawerOpen(true);
  };

  const closeDrawer = () => {
    setDrawerOpen(false);
    setSelectedUser(null);
  };

  return (
    <AdminLayout>
      <Drawer open={drawerOpen} close={closeDrawer}>
        <InternalUserForm user={selectedUser} onClose={closeDrawer} />
      </Drawer>

      <PageLayout
        pageName="Ops Users"
        actionButton={<Button onClick={openCreate}>Add User</Button>}
      >
        {isLoading ? (
          <div className="flex flex-col gap-3">
            {Array.from({length: 4}).map((_, i) => (
              <div
                key={i}
                className="flex h-[52px] animate-pulse flex-col gap-1 border-t border-border py-3"
              >
                <div className="h-3 w-40 rounded bg-gray-200" />
                <div className="h-3 w-56 rounded bg-gray-100" />
              </div>
            ))}
          </div>
        ) : !data?.data?.length ? (
          <NoDataFoundComponent />
        ) : (
          <InternalUsersList users={data.data} onEdit={openEdit} />
        )}
      </PageLayout>
    </AdminLayout>
  );
}
