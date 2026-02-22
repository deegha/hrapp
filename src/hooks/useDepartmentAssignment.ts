import {useState} from "react";
import {
  assignDepartmentToUser,
  requestDepartmentAssignmentForUser,
  requestDepartmentRemovalForUser,
  fetchMyPermissions,
} from "@/services/userService";
import {useNotificationStore} from "@/store/notificationStore";
import {useConfirmationModalStore} from "@/store/useConfirmationModalStore";
import useSWR, {mutate} from "swr";

export function useDepartmentAssignment() {
  const [loading, setLoading] = useState(false);
  const {showNotification} = useNotificationStore();
  const {openModal} = useConfirmationModalStore();
  const {data: userPermissionData} = useSWR("my-permissions", fetchMyPermissions);

  // Helper function to revalidate user pending approvals and show success notification
  const revalidateAndNotify = async (employeeId: number, message: string) => {
    await mutate(`user-pending-approvals-${employeeId}`);
    showNotification({
      type: "success",
      message,
    });
  };

  // Check user permissions
  const getUserPermissionStatus = () => {
    const userPermission = userPermissionData?.data?.permission;
    const isAdmin = userPermission === "ADMIN_USER" || userPermission === "SUPER_USER";
    const isL2Admin = userPermission === "ADMIN_USER_L2";
    return {isAdmin, isL2Admin, hasPermission: isAdmin || isL2Admin};
  };

  const assignDepartment = async (
    employeeId: number,
    departmentId: string,
    onSuccess: () => void,
  ) => {
    const {isAdmin, isL2Admin, hasPermission} = getUserPermissionStatus();

    if (!hasPermission) {
      showNotification({
        type: "error",
        message: "You don't have permission to assign departments",
      });
      return;
    }

    try {
      setLoading(true);

      if (isAdmin) {
        // Admin can directly assign
        await assignDepartmentToUser(employeeId, parseInt(departmentId));
        await onSuccess();
        showNotification({
          type: "success",
          message: "Department assigned successfully",
        });
      } else if (isL2Admin) {
        // L2 Admin creates a request
        await requestDepartmentAssignmentForUser(employeeId, parseInt(departmentId));
        await revalidateAndNotify(
          employeeId,
          "Department assignment request created. Waiting for admin approval.",
        );
      }
    } catch (error) {
      showNotification({
        type: "error",
        message: (error as string) || "Something went wrong when assigning department",
      });
    } finally {
      setLoading(false);
    }
  };

  const removeDepartment = async (employeeId: number, onSuccess: () => void) => {
    const {isAdmin, isL2Admin} = getUserPermissionStatus();

    const title = isAdmin ? "Remove Department" : "Request Department Removal";
    const description = isAdmin
      ? "Are you sure you want to remove this user from their department?"
      : "Are you sure you want to request removal of this user from their department?";

    openModal({
      title,
      description,
      onConfirm: async () => {
        try {
          setLoading(true);

          if (isAdmin) {
            // Admin can directly remove
            await assignDepartmentToUser(employeeId, null);
            await onSuccess();
            showNotification({
              type: "success",
              message: "Department removed successfully",
            });
          } else if (isL2Admin) {
            // L2 Admin creates a request
            await requestDepartmentRemovalForUser(employeeId);
            await revalidateAndNotify(
              employeeId,
              "Department removal request created. Waiting for admin approval.",
            );
          }
        } catch (error) {
          showNotification({
            type: "error",
            message: (error as string) || "Failed to process department removal",
          });
        } finally {
          setLoading(false);
        }
      },
    });
  };

  const canRemoveDepartment = (): boolean => {
    const {hasPermission} = getUserPermissionStatus();
    return hasPermission;
  };

  return {
    loading,
    assignDepartment,
    removeDepartment,
    canRemoveDepartment,
  };
}
