import {useState} from "react";
import {Autocomplete} from "@/components";
import {Detail} from "@/components";
import {XCircle} from "react-feather";
import {useNotificationStore} from "@/store/notificationStore";
import {useUserSearch} from "@/hooks/useUserSearch";
import {assignManager} from "@/services/userService";

interface UserManagerSectionProps {
  employeeId: number;
  manager?: {id: number; firstName: string; lastName: string} | null;
  isAdmin: boolean;
  onChanged: () => void | Promise<void>;
}

export function UserManagerSection({
  employeeId,
  manager,
  isAdmin,
  onChanged,
}: UserManagerSectionProps) {
  const {showNotification} = useNotificationStore();
  const {searchResults, setSearchTerm, loading} = useUserSearch();
  const [loadingManagerAssigning, setLoadingManagerAssigning] = useState(false);

  const doAssignManager = async (managerId?: string) => {
    try {
      setLoadingManagerAssigning(true);
      await assignManager(employeeId, managerId ? parseInt(managerId) : null);
      await onChanged();
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

  const selected = manager
    ? {
        label: `${manager.firstName} ${manager.lastName}`,
        value: manager.id.toString(),
      }
    : {label: "", value: ""};

  return (
    <div className="flex flex-col gap-3">
      <h2>User Manager</h2>
      <Detail
        loading={loadingManagerAssigning}
        label={"Manager"}
        value={
          manager ? (
            <div className="flex items-center gap-2">
              {manager.firstName} {manager.lastName}
              {isAdmin && (
                <div
                  onClick={() => doAssignManager()}
                  className="cursor-pointer font-bold text-red-500 hover:text-red-700"
                  title="Remove manager"
                >
                  <XCircle size={12} />
                </div>
              )}
            </div>
          ) : isAdmin ? (
            <Autocomplete
              loading={loading}
              value={selected}
              options={searchResults}
              onSearch={(option) => setSearchTerm(option)}
              onChange={async (option) => {
                if (!option) return;
                doAssignManager(option.value);
              }}
            />
          ) : (
            <span className="text-sm text-textSecondary">No manager assigned</span>
          )
        }
      />
    </div>
  );
}
