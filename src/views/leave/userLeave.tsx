import { PageLayout, Button } from "@/components";

export function UserLeave() {
  return (
    <PageLayout
      pageName="Leave Management"
      actionButton={
        <Button onClick={() => console.log("here we are")}>Apply Leave</Button>
      }
    >
      <div className=""></div>
    </PageLayout>
  );
}
