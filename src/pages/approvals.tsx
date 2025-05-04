import {
  Layout,
  PageLayout,
  NoDataFound,
  ItemsList,
  Drawer,
} from "@/components";
import useSWR from "swr";
import { approvalService } from "@/services/approvalService";
import { usePagination } from "@/hooks/usePagination";
import { useApprovalStore } from "@/store/approvalStore";

export default function Home() {
  const { activePage } = usePagination();
  const { approval, setActiveApproval, unsetApproval } = useApprovalStore();
  const { data: approvalResponse } = useSWR(`approval-service`, () =>
    approvalService({ page: parseInt(activePage), limit: 10 })
  );

  console.log(approvalResponse?.data.data);

  if (approvalResponse?.data.data.length === 0)
    return <NoDataFound pageName="Approvals" />;

  return (
    <Layout>
      <PageLayout pageName="Approvals">
        <Drawer open={approval?.id ? true : false} close={unsetApproval}>
          <div></div>
        </Drawer>
        {approvalResponse?.data.data.map((approval) => (
          <ItemsList
            key={`${approval.createdAt}-p`}
            title={approval.type}
            status={approval.status}
            content={<div></div>}
            onClick={() => setActiveApproval(approval)}
          />
        ))}
      </PageLayout>
    </Layout>
  );
}
