import { PageLayout, Button } from "@/components";
import { useRouter } from "next/navigation";

export function UserLeave() {
  const router = useRouter();

  function handleApplyLeave() {
    router.push("./leave-management/apply");
  }

  return (
    <PageLayout
      pageName="Leave Management"
      actionButton={
        <Button onClick={handleApplyLeave}>Request time out</Button>
      }
    >
      <div className=""></div>
    </PageLayout>
  );
}
