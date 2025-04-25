import { Button, Layout, PageLayout, NoDataFoundComponent } from "@/components";
import { useRouter } from "next/router";
export default function UserManagement() {
  const router = useRouter();

  function handleApplyLeave() {
    router.push("./user-management/create-user");
  }

  return (
    <Layout>
      <PageLayout
        actionButton={<Button onClick={handleApplyLeave}>CREATE USER</Button>}
        pageName="User Management"
      >
        <NoDataFoundComponent />
      </PageLayout>
    </Layout>
  );
}
