import { StatusTag } from "@/components";
import { TUser } from "@/types/user";

interface IUsers {
  users: TUser[];
}
export function Users({ users }: IUsers) {
  return (
    <div>
      {users.map((user) => (
        <div
          key={user.employeeId}
          className="border-border border-t py-3 flex justify-between"
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
