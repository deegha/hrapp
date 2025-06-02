import {Layout, PageLayout, NoDataFound, ItemsList, Drawer, Pagination} from "@/components";
import useSWR from "swr";
import {approvalService} from "@/services/approvalService";
import {usePagination} from "@/hooks/usePagination";
import {useApprovalStore} from "@/store/approvalStore";
import {ApprovalDetailsLeave, ApprovalDetailsUser} from "@/views/approvals";
import moment from "moment";

export default function Home() {
  const {activePage} = usePagination();
  const {approval, setActiveApproval, unsetApproval} = useApprovalStore();
  const {data: approvalResponse} = useSWR(`approval-service-${activePage}`, () =>
    approvalService({page: parseInt(activePage), limit: 10}),
  );

  if (!approvalResponse || approvalResponse?.data?.data?.length === 0)
    return <NoDataFound pageName="Approvals" />;

  return (
    <Layout>
      <PageLayout pageName="Approvals">
        <Drawer open={approval?.id ? true : false} close={unsetApproval}>
          {approval.type === "LEAVEREQUEST" ? <ApprovalDetailsLeave /> : <ApprovalDetailsUser />}
        </Drawer>

        <div className="flex flex-col gap-5">
          <div>
            {approvalResponse?.data?.data?.map((app) => (
              <ItemsList
                key={`${app.createdAt}-p`}
                title={app.title}
                status={app.status}
                content={
                  <div>Created on {moment(app.createdAt).format("YYYY-Do-MMMM : hh:MM A")}</div>
                }
                onClick={() => setActiveApproval(app)}
              />
            ))}
          </div>
          {approvalResponse?.data?.totalPages > 1 && (
            <Pagination numberOfPage={approvalResponse?.data.totalPages as number} />
          )}
        </div>
      </PageLayout>
    </Layout>
  );
}
