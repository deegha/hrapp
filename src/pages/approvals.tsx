import { Layout, PageLayout, NoDataFound, ItemsList, Drawer, Pagination } from "@/components";
import useSWR from "swr";
import { approvalService } from "@/services/approvalService";
import { usePagination } from "@/hooks/usePagination";
import { useApprovalStore } from "@/store/approvalStore";
import {
  ApprovalDetailsLeave,
  ApprovalDetailsUser,
  ApprovalDetailsDepartment,
  ApprovalDetailsUserUpdate,
  ApprovalDetailsWFH,
} from "@/views/approvals";
import moment from "moment";

export default function Home() {
  const { activePage } = usePagination();
  const { approval, setActiveApproval, unsetApproval } = useApprovalStore();
  const { data: approvalResponse } = useSWR(`approval-service-${activePage}`, () =>
    approvalService({ page: parseInt(activePage), limit: 10 }),
  );

  if (!approvalResponse || approvalResponse?.data?.data?.length === 0)
    return <NoDataFound pageName="Approvals" />;

  return (
    <Layout>
      <PageLayout pageName="Approvals">
        <Drawer open={approval?.id ? true : false} close={unsetApproval}>
          {approval.type === "LEAVEREQUEST" ? (
            <ApprovalDetailsLeave />
          ) : approval.type === "DEPARTMENT_ASSIGNMENT" ? (
            <ApprovalDetailsDepartment />
          ) : approval.type === "USER_UPDATE" ? (
            <ApprovalDetailsUserUpdate />
          ) : approval.type === "WFH_REQUEST" ? (
            <ApprovalDetailsWFH />
          ) : (
            <ApprovalDetailsUser />
          )}
        </Drawer>

        <div className="flex flex-col gap-5">
          <div>
            {approvalResponse?.data?.data?.map((app) => (
              <ItemsList
                key={`approval-${app.id}`}
                title={app.title}
                status={app.status}
                content={
                  <div>
                    Created on{" "}
                    {moment.utc(app.createdAt).local().format("YYYY-Do-MMMM : hh:mm A")}
                  </div>
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
