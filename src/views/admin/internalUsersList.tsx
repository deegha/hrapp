import {ItemsList} from "@/components";
import {TInternalUser, deleteInternalUser} from "@/services/adminService";
import {useConfirmationModalStore} from "@/store/useConfirmationModalStore";
import {useNotificationStore} from "@/store/notificationStore";
import {useAdminAuthStore} from "@/store/adminAuthStore";
import {Edit2, Trash2} from "react-feather";
import {mutate} from "swr";

interface IProps {
  users: TInternalUser[];
  onEdit: (user: TInternalUser) => void;
}

export function InternalUsersList({users, onEdit}: IProps) {
  const {openModal} = useConfirmationModalStore();
  const {showNotification} = useNotificationStore();
  const {user: me} = useAdminAuthStore();

  const handleDelete = (user: TInternalUser) => {
    openModal({
      title: "Delete ops user?",
      description: `Are you sure you want to remove ${user.firstName} ${user.lastName}? This cannot be undone.`,
      onConfirm: async () => {
        try {
          const res = await deleteInternalUser(user.id);
          if (res.error) {
            showNotification({type: "error", message: "Failed to delete user"});
            return;
          }
          showNotification({type: "success", message: "User removed"});
          mutate("admin-internal-users");
        } catch {
          showNotification({type: "error", message: "Something went wrong"});
        }
      },
    });
  };

  return (
    <div>
      {users.map((user) => (
        <ItemsList
          key={user.id}
          title={
            <div className="flex items-center gap-2">
              <span>
                {user.firstName} {user.lastName}
              </span>
              {user.id === me?.id && (
                <span className="inline-block rounded-md bg-primary px-[6px] py-[2px] text-xxs font-medium text-white">
                  You
                </span>
              )}
            </div>
          }
          content={<span>{user.email}</span>}
          actionArea={
            <div className="flex items-center gap-3">
              <button
                onClick={() => onEdit(user)}
                className="text-textSecondary hover:text-textPrimary"
                aria-label="Edit user"
              >
                <Edit2 size={14} />
              </button>
              {user.id !== me?.id && (
                <button
                  onClick={() => handleDelete(user)}
                  className="text-textSecondary hover:text-danger"
                  aria-label="Delete user"
                >
                  <Trash2 size={14} />
                </button>
              )}
            </div>
          }
        />
      ))}
    </div>
  );
}
