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
          title={`${user.firstName} ${user.lastName}`}
          content={
            <>
              <span>EMPID: {user.employeeId}</span>
              <span>{user.email}</span>
              {user.EmploymentType && <span>Type: {user.EmploymentType.typeLabel}</span>}
            </>
          }
          status={user.UserStatus?.statusLabel}
        />
      ))}
    </div>
  );
}
