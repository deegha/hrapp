import {useState} from "react";
import {
  assignDepartmentToUser,
  requestDepartmentAssignmentForUser,
  requestDepartmentRemovalForUser,
  fetchMyPermissions,
} from "@/services/userService";
import {useNotificationStore} from "@/store/notificationStore";
import {useConfirmationModalStore} from "@/store/useConfirmationModalStore";
import useSWR from "swr";

export function useDepartmentAssignment() {
  const [loading, setLoading] = useState(false);
  const {showNotification} = useNotificationStore();
  const {openModal} = useConfirmationModalStore();
  const {data: userPermissionData} = useSWR("my-permissions", fetchMyPermissions);

  const assignDepartment = async (
    employeeId: number,
    departmentId: string,
    onSuccess: () => void,
  ) => {
    const userPermission = userPermissionData?.data?.permission;
    const isAdmin = userPermission === "ADMIN_USER" || userPermission === "SUPER_USER";
    const isL2Admin = userPermission === "ADMIN_USER_L2";

    if (!isAdmin && !isL2Admin) {
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
        showNotification({
          type: "success",
          message: "Department assignment request created. Waiting for admin approval.",
        });
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
    const userPermission = userPermissionData?.data?.permission;
    const isAdmin = userPermission === "ADMIN_USER" || userPermission === "SUPER_USER";
    const isL2Admin = userPermission === "ADMIN_USER_L2";

    if (!isAdmin && !isL2Admin) {
      showNotification({
        type: "error",
        message: "You don't have permission to remove department assignments",
      });
      return;
    }

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
            showNotification({
              type: "success",
              message: "Department removal request created. Waiting for admin approval.",
            });
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

  const canRemoveDepartment = () => {
    const userPermission = userPermissionData?.data?.permission;
    return (
      userPermission === "ADMIN_USER" ||
      userPermission === "SUPER_USER" ||
      userPermission === "ADMIN_USER_L2"
    );
  };

  return {
    loading,
    assignDepartment,
    removeDepartment,
    canRemoveDepartment,
  };
}
