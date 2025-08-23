import {ItemsList} from "@/components";
import {TUser} from "@/types/user";
import {useUserStore} from "@/store/useUserStore";

interface IUsers {
  users: TUser[];
}
export function Users({users}: IUsers) {
  const {setActiveUser} = useUserStore();
  return (
    <div>
      {users.map((user) => (
        <ItemsList
          onClick={() => setActiveUser(user.employeeId.toString())}
          key={user.employeeId}
          title={
            <div className="flex items-center gap-2">
              <span>{`${user.firstName} ${user.lastName}`}</span>
              {user.isManager && (
                <span className="inline-block rounded-md bg-secondary px-[6px] py-[2px] text-xxs font-medium text-white">
                  Manager
                </span>
              )}
            </div>
          }
          content={
            <>
              <span>EMPID: {user.employeeId}</span>
              <span>{user.email}</span>
              {user.EmploymentType && <span>Type: {user.EmploymentType.typeLabel}</span>}
              {user.manager && (
                <span>
                  Managed by: {user.manager.firstName} {user.manager.lastName}
                </span>
              )}
            </>
          }
          status={user.UserStatus?.statusLabel}
        />
      ))}
    </div>
  );
}
