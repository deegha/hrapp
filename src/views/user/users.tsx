import { StatusTag } from "@/components";
import { TUser } from "@/types/user";
import { useUserStore } from "@/store/useUserStore";

interface IUsers {
  users: TUser[];
}
export function Users({ users }: IUsers) {
  const { setActiveUser } = useUserStore();
  return (
    <div>
      {users.map((user) => (
        <div
          key={user.employeeId}
          className="border-border border-t py-3 flex justify-between cursor-pointer"
          onClick={() => setActiveUser(user.employeeId.toString())}
        >
          <div>
            <p className="text-sm">
              {user.firstName} {user.lastName}
            </p>
            <p className="text-sm text-textSecondary flex gap-2">
              <span>EMPID: {user.employeeId}</span>
              <span>{user.email}</span>
            </p>
          </div>
          <div className="text-sm">
            <StatusTag status={user.UserStatus.statusLabel} type="DELETED" />
          </div>
        </div>
      ))}
    </div>
  );
}
