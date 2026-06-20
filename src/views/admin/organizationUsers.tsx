import {ItemsList} from "@/components";
import {TAdminUser} from "@/services/adminService";

interface IProps {
  users: TAdminUser[];
}

export function OrganizationUsers({users}: IProps) {
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
              {user.isManager && (
                <span className="inline-block rounded-md bg-secondary px-[6px] py-[2px] text-xxs font-medium text-white">
                  Manager
                </span>
              )}
            </div>
          }
          content={
            <>
              {user.employeeId && <span>EMPID: {user.employeeId}</span>}
              <span>{user.email}</span>
              {user.EmploymentType && <span>Type: {user.EmploymentType.typeLabel}</span>}
              {user.Department && <span>Dept: {user.Department.departmentName}</span>}
              {user.manager && (
                <span>
                  Manager: {user.manager.firstName} {user.manager.lastName}
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
