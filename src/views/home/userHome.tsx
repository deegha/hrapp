import { PageLayout, Button } from "@/components";

export function UserHome() {
  return (
    <PageLayout
      pageName="Home"
      actionButton={
        <Button onClick={() => console.log("here we are")}>Apply Leave</Button>
      }
    >
      <div className=""></div>{" "}
    </PageLayout>
  );
}
