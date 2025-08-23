import {StatusTag, Button, Detail, Autocomplete} from "@/components";
import {useConfirmationModalStore} from "@/store/useConfirmationModalStore";
import {Trash, ArrowUp, XCircle} from "react-feather";
import {
  deleteUser,
  updateEmploymentType,
  fetchEmploymentTypes,
  assignManager,
} from "@/services/userService";
import {usePagination} from "@/hooks/usePagination";
import {useNotificationStore} from "@/store/notificationStore";
import {mutate} from "swr";
import {useUserStore} from "@/store/useUserStore";
import useSWR from "swr";
import {useState} from "react";
import {roles} from "@/utils/staticValues";
import {useUserSearch} from "@/hooks/useUserSearch";

export function UserDetails() {
  const {openModal} = useConfirmationModalStore();
  const {activePage} = usePagination();
  const {showNotification} = useNotificationStore();
  const {unsetUser, user, setActiveUser} = useUserStore();
  const [isUpdatingEmploymentType, setIsUpdatingEmploymentType] = useState(false);
  const {data: employmentTypesData} = useSWR("fetch-employment-types", fetchEmploymentTypes);
  const {searchResults, setSearchTerm, loading} = useUserSearch();
  const [loadingManagerAssigning, setLoadingManagerAssigning] = useState(false);

  const getNextEmploymentType = () => {
    if (!user.EmploymentType || !employmentTypesData?.data) return null;

    const currentType = user.EmploymentType.typeLabel;
    const employmentTypes = employmentTypesData.data;

    const transitions: Record<string, string> = {
      INTERN: "PROBATION",
      PROBATION: "FULLTIME",
    };

    const nextTypeLabel = transitions[currentType];
    if (!nextTypeLabel) return null;

    return employmentTypes.find((type) => type.typeLabel === nextTypeLabel);
  };

  const handleEmploymentTypeTransition = () => {
    const nextType = getNextEmploymentType();
    if (!nextType) return;

    openModal({
      title: `Promote to ${nextType.typeLabel}?`,
      description: `Are you sure you want to promote ${user.firstName} ${user.lastName} from ${user.EmploymentType?.typeLabel} to ${nextType.typeLabel}?`,
      onConfirm: async () => {
        try {
          setIsUpdatingEmploymentType(true);
          const response = await updateEmploymentType(user.employeeId, nextType.id);

          if (response.error) {
            showNotification({
              type: "error",
              message: "Something went wrong when updating employment type",
            });
            return;
          }

          // Refresh user data in store and user list
          refreshUserDetails();
          showNotification({
            type: "success",
            message: `Successfully promoted to ${nextType.typeLabel}`,
          });
        } catch {
          showNotification({
            type: "error",
            message: "Something went wrong when updating employment type",
          });
        } finally {
          setIsUpdatingEmploymentType(false);
        }
      },
    });
  };

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
    showNotification({
      type: "success",
      message: "Successfully updated manager",
    });
  };

  const doAssignManager = async (managerId?: string) => {
    try {
      setLoadingManagerAssigning(true);
      await assignManager(user.employeeId, managerId ? parseInt(managerId) : null);
      await refreshUserDetails();
      setSearchTerm("");
    } catch (error) {
      showNotification({
        type: "error",
        message: (error as string) || "Something went wrong when assigning manager",
      });
    } finally {
      setLoadingManagerAssigning(false);
    }
  };

  const userLevel = roles[user?.userLevel as keyof typeof roles] || user?.userLevel;

  const manager = {
    label: user.manager ? `${user.manager.firstName} ${user.manager.lastName}` : "",
    value: user.manager ? user.manager.id.toString() : "",
  };

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
      </div>

      <div className="flex flex-col gap-3">
        <h2>User Manager</h2>
        <Detail
          loading={loadingManagerAssigning}
          label={"Manager"}
          value={
            user.manager ? (
              <div className="flex items-center gap-2">
                {user.manager.firstName} {user.manager.lastName}
                <div
                  onClick={() => doAssignManager()}
                  className="cursor-pointer font-bold text-red-500 hover:text-red-700"
                >
                  <XCircle size={12} />
                </div>
              </div>
            ) : (
              <Autocomplete
                loading={loading}
                value={{
                  label: manager?.label || "",
                  value: manager.value || "",
                }}
                options={searchResults}
                onSearch={(option) => setSearchTerm(option)}
                onChange={async (option) => {
                  if (!option) return;
                  doAssignManager(option.value);
                }}
              />
            )
          }
        />
      </div>

      {user.activityLogs && user.activityLogs.length > 0 && (
        <div className="flex flex-col gap-3">
          <h2>Most Recent User Logs</h2>
          {user.activityLogs.map((log, i) => (
            <div key={i} className="flex flex-col gap-1 border-b border-border py-2 text-sm">
              <div className="flex font-semibold text-textSecondary">
                <div className="text-sm">{log.content}</div>
              </div>
              <div className="text-xs text-textSecondary">
                {new Date(log.createdAt).toDateString()}
              </div>
            </div>
          ))}
        </div>
      )}
      <div className="flex w-full gap-3">
        {/* <Button variant="secondary">
          <div className="flex gap-1 items-center">
            <Edit size={14} /> Edit
          </div>
        </Button> */}

        {getNextEmploymentType() && user.UserStatus?.statusLabel === "APPROVED" && (
          <Button
            variant="secondary"
            onClick={handleEmploymentTypeTransition}
            loading={isUpdatingEmploymentType}
          >
            <div className="flex items-center gap-1">
              <ArrowUp size={14} />
              Promote to {getNextEmploymentType()?.typeLabel}
            </div>
          </Button>
        )}

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
