// hooks/useApproval.ts
import {useState} from "react";
import {mutate} from "swr";
import {approveRequest} from "@/services/approvalService";
import {useApprovalStore} from "@/store/approvalStore";
import {useNotificationStore} from "@/store/notificationStore";
import {usePagination} from "@/hooks/usePagination";
import {useConfirmationModalStore} from "@/store/useConfirmationModalStore";

type ApprovalAction = "APPROVED" | "REJECTED";

function getComs(type: "USER" | "LEAVEREQUEST" | "DEPARTMENT_ASSIGNMENT" | "USER_UPDATE") {
  if (type === "USER" || type === "USER_UPDATE")
    return {
      REJECTED: {
        CONFIRMATION_MODAL: {
          TITLE: type === "USER_UPDATE" ? "Reject user update?" : "Reject user request?",
          DESCRIPTION:
            type === "USER_UPDATE"
              ? "Are you sure you want to reject this user update?"
              : "Are you sure you want to reject this user request?",
        },
        ERROR:
          type === "USER_UPDATE"
            ? "Couldn't reject the user update"
            : "Couldn't reject the user request",
        SUCCESS:
          type === "USER_UPDATE"
            ? "User update rejected successfully"
            : "User creation rejected successfully",
      },
      APPROVED: {
        ERROR:
          type === "USER_UPDATE"
            ? "Couldn't approve the user update"
            : "Couldn't approve the user request",
        SUCCESS:
          type === "USER_UPDATE"
            ? "User update approved successfully"
            : "User approved successfully",
      },
    };

  if (type === "DEPARTMENT_ASSIGNMENT")
    return {
      REJECTED: {
        CONFIRMATION_MODAL: {
          TITLE: "Reject department assignment request?",
          DESCRIPTION: "Are you sure you want to reject this department assignment request?",
        },
        ERROR: "Couldn't reject the department assignment request",
        SUCCESS: "Department assignment request rejected successfully",
      },
      APPROVED: {
        ERROR: "Couldn't approve the department assignment request",
        SUCCESS: "Department assignment request approved successfully",
      },
    };

  return {
    REJECTED: {
      CONFIRMATION_MODAL: {
        TITLE: "Reject leave request?",
        DESCRIPTION: "Are you sure you want to reject this leave request?",
      },
      ERROR: "Couldn't reject the leave request",
      SUCCESS: "Leave request rejected successfully",
    },
    APPROVED: {
      ERROR: "Couldn't approve the leave request",
      SUCCESS: "Leave request approved successfully",
    },
  };
}

interface ApprovalHandlerPayload {
  itemId: number;
  action: ApprovalAction;
  rejectedReason?: string;
}

export function useApproval() {
  const {approval, unsetApproval} = useApprovalStore();
  const {showNotification} = useNotificationStore();
  const {activePage} = usePagination();
  const [loading, setLoading] = useState<ApprovalAction>();
  const {openModal} = useConfirmationModalStore();
  const comms = getComs(approval.type);

  const handleConfirmation = (itemId: number) => {
    openModal({
      title: comms.REJECTED.CONFIRMATION_MODAL?.TITLE,
      description: comms.REJECTED.CONFIRMATION_MODAL?.DESCRIPTION,
      onConfirm: () => {
        handleApproval({
          itemId,
          action: "REJECTED",
        });
      },
    });
  };

  const handleApproval = async ({itemId, action, rejectedReason}: ApprovalHandlerPayload) => {
    try {
      setLoading(action);
      const response = await approveRequest(approval.type, {
        approvalRequestId: approval.id,
        itemId,
        approveReject: action,
        rejectedReason,
      });

      if (response.error) {
        console.log(response.error);
        setLoading(undefined);
        showNotification({
          message: comms[action].ERROR,
          type: "error",
        });
        return;
      }

      showNotification({
        message: comms[action].SUCCESS,
        type: "success",
      });

      mutate(`approval-service-${activePage}`);
      unsetApproval();

      setLoading(undefined);
    } catch (error) {
      console.error(error);
      showNotification({
        message: comms[action].ERROR,
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
