import {StatusTag, Button, Detail} from "@/components";
import {useConfirmationModalStore} from "@/store/useConfirmationModalStore";
import {Trash} from "react-feather";
import {
  deleteUser,
  fetchEmploymentTypes,
  fetchUserPendingApprovals,
  fetchMyPermissions,
} from "@/services/userService";
import {fetchDepartments} from "@/services/organizationService";
import {usePagination} from "@/hooks/usePagination";
import {useNotificationStore} from "@/store/notificationStore";
import {mutate} from "swr";
import {useUserStore} from "@/store/useUserStore";
import useSWR from "swr";

import {roles} from "@/utils/staticValues";
import {useDepartmentAssignment} from "@/hooks/useDepartmentAssignment";
import {UserDepartment} from "./department";
import {UserManagerSection} from "@/views/user/components/UserManagerSection";
import {UserDocumentsSection} from "@/views/user/components/UserDocumentsSection";
import {EmploymentTypePromotion} from "@/views/user/components/EmploymentTypePromotion";
import {UserActivityLogs} from "@/views/user/components/UserActivityLogs";

export function UserDetails() {
  const {openModal} = useConfirmationModalStore();
  const {activePage} = usePagination();
  const {showNotification} = useNotificationStore();
  const {unsetUser, user, setActiveUser} = useUserStore();

  const {data: employmentTypesData} = useSWR("fetch-employment-types", fetchEmploymentTypes);
  const {data: departmentsData} = useSWR("departments", fetchDepartments);
  const {data: userPermissionData} = useSWR("my-permissions", fetchMyPermissions);
  const {data: userPendingApprovalsData} = useSWR(
    user?.employeeId ? `user-pending-approvals-${user.employeeId}` : null,
    () => (user?.employeeId ? fetchUserPendingApprovals(user.employeeId) : null),
  );

  const {
    loading: loadingDepartmentAssigning,
    assignDepartment,
    removeDepartment,
    canRemoveDepartment,
  } = useDepartmentAssignment();

  const handleDeleteUser = () => {
    openModal({
      title: "Delete user ?",
      description: "Are you sure you want to delete this user",
      onConfirm: async () => {
        try {
          const response = await deleteUser(user.employeeId);
          if (response.error) {
            showNotification({
              type: "error",
              message: "Something went wrong when deleting user",
            });
            return;
          }

          mutate(`fetch-users${activePage}`);
          showNotification({
            type: "success",
            message: "Successfully deleted user",
          });
          unsetUser();
        } catch {
          showNotification({
            type: "error",
            message: "Something went wrong when deleting user",
          });
        }
      },
    });
  };

  const refreshUserDetails = async () => {
    await setActiveUser(user.employeeId.toString());
    mutate(`fetch-users${activePage}`);
  };

  const handleAssignDepartment = async (departmentId: string) => {
    await assignDepartment(user.employeeId, departmentId, refreshUserDetails);
  };

  const handleRemoveDepartment = async () => {
    await removeDepartment(user.employeeId, refreshUserDetails);
  };

  const userLevel = roles[user?.userLevel as keyof typeof roles] || user?.userLevel;

  const userPermission = userPermissionData?.data?.permission;
  const isAdmin = userPermission === "ADMIN_USER" || userPermission === "SUPER_USER";
  const canUploadEmployeeDocs = isAdmin || userPermission === "ADMIN_USER_L2";

  return (
    <div className="flex flex-col gap-10">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-[32px] font-semibold uppercase">
            {user.firstName} {user.lastName} (EMP-{user.employeeId})
          </h1>
          {user.isManager && (
            <span className="inline-block rounded-md bg-secondary px-[6px] py-[2px] text-xxs font-medium text-white">
              Manager
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <StatusTag status={user.UserStatus?.statusLabel} />
        </div>
      </div>
      <div className="flex flex-col gap-3">
        <h2>User Details</h2>
        <Detail label={"First Name"} value={user.firstName} />
        <Detail label={"Last Name"} value={user.lastName} />
        <Detail label={"Email"} value={user.email} type="email" />
        <Detail label={"User Level"} value={userLevel} />
        {user.EmploymentType && (
          <Detail label={"Employment Type"} value={user.EmploymentType.typeLabel} />
        )}
        {user.Department && <Detail label={"Department"} value={user.Department.departmentName} />}
      </div>

      <UserManagerSection
        employeeId={user.employeeId}
        manager={user.manager}
        isAdmin={isAdmin}
        onChanged={refreshUserDetails}
      />

      <div className="flex flex-col gap-3">
        <h2>User Department</h2>
        <UserDepartment
          key={`department-${user.employeeId}-${user.Department?.id || "none"}`}
          currentDepartment={user.Department}
          departments={departmentsData?.data || []}
          onAssignDepartment={handleAssignDepartment}
          onRemoveDepartment={handleRemoveDepartment}
          loading={loadingDepartmentAssigning}
          canRemove={canRemoveDepartment()}
          userId={user.employeeId}
          approvals={userPendingApprovalsData?.data || []}
        />
      </div>

      <UserDocumentsSection
        userId={user.employeeId}
        documents={user.documents}
        canUpload={canUploadEmployeeDocs}
        isAdmin={isAdmin}
        onChanged={refreshUserDetails}
      />

      <UserActivityLogs logs={user.activityLogs} />
      <div className="flex w-full gap-3">
        {/* <Button variant="secondary">
          <div className="flex gap-1 items-center">
            <Edit size={14} /> Edit
          </div>
        </Button> */}

        <EmploymentTypePromotion
          employeeId={user.employeeId}
          currentType={user.EmploymentType || null}
          employmentTypes={employmentTypesData?.data}
          userName={`${user.firstName} ${user.lastName}`}
          userStatus={user.UserStatus?.statusLabel}
          onPromoted={refreshUserDetails}
        />

        {user.UserStatus?.statusLabel !== "DELETED" && (
          <Button variant="danger" onClick={handleDeleteUser}>
            <div className="flex items-center gap-1">
              <Trash size={14} />
              Delete
            </div>
          </Button>
        )}
      </div>
    </div>
  );
}
