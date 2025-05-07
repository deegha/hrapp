// hooks/useApproval.ts
import { useState } from "react";
import { mutate } from "swr";
import { approveRequest } from "@/services/approvalService";
import { useApprovalStore } from "@/store/approvalStore";
import { useNotificationStore } from "@/store/notificationStore";
import { usePagination } from "@/hooks/usePagination";
import { useConfirmationModalStore } from "@/store/useConfirmationModalStore";

type ApprovalAction = "APPROVED" | "REJECTED";

interface ApprovalHandlerPayload {
  itemId: number;
  action: ApprovalAction;
  rejectedReason?: string;
}

export function useApproval() {
  const { approval, unsetApproval } = useApprovalStore();
  const { showNotification } = useNotificationStore();
  const { activePage } = usePagination();
  const [loading, setLoading] = useState<ApprovalAction>();
  const { openModal } = useConfirmationModalStore();

  const handleConfirmation = (itemId: number) => {
    openModal({
      title: "Reject leave request?",
      description: "Are you sure you want to reject this leave request?",
      onConfirm: () => {
        handleApproval({
          itemId,
          action: "REJECTED",
        });
      },
    });
  };

  const handleApproval = async ({
    itemId,
    action,
    rejectedReason,
  }: ApprovalHandlerPayload) => {
    try {
      setLoading(action);
      const response = await approveRequest(approval.type, {
        approvalRequestId: approval.id,
        itemId,
        approveReject: action,
        rejectedReason,
      });

      if (response.error) {
        setLoading(undefined);
        showNotification({
          message: `Couldn't ${action.toLowerCase()} the leave request`,
          type: "error",
        });
        return;
      }

      showNotification({
        message: `Leave ${action.toLowerCase()} successfully`,
        type: "success",
      });

      mutate(`approval-service-${activePage}`);
      unsetApproval();

      setLoading(undefined);
    } catch (error) {
      console.error(error);
      showNotification({
        message: `Could not ${action.toLowerCase()} the leave`,
        type: "error",
      });
    } finally {
      setLoading(undefined);
    }
  };

  return {
    handleApproval,
    loading,
    handleConfirmation,
  };
}
