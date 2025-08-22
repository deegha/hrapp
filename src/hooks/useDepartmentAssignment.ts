import {useState} from "react";
import {
  assignDepartmentToUser,
  requestDepartmentAssignmentForUser,
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

    if (!isAdmin) {
      showNotification({
        type: "error",
        message: "Only admins can remove department assignments",
      });
      return;
    }

    openModal({
      title: "Remove Department",
      description: "Are you sure you want to remove this user from their department?",
      onConfirm: async () => {
        try {
          setLoading(true);
          await assignDepartmentToUser(employeeId, null);
          await onSuccess();
          showNotification({
            type: "success",
            message: "Department removed successfully",
          });
        } catch {
          showNotification({
            type: "error",
            message: "Failed to remove department",
          });
        } finally {
          setLoading(false);
        }
      },
    });
  };

  const canRemoveDepartment = () => {
    const userPermission = userPermissionData?.data?.permission;
    return userPermission === "ADMIN_USER" || userPermission === "SUPER_USER";
  };

  return {
    loading,
    assignDepartment,
    removeDepartment,
    canRemoveDepartment,
  };
}
