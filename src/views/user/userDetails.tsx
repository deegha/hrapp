import { TAllUserDetails } from "@/types/user";
import { StatusTag, Button, Detail } from "@/components";
import { Trash, CheckCircle, Edit } from "react-feather";

interface IUserDetails {
  user: TAllUserDetails;
}

const logs = [
  {
    log: "Jason requested leave on 2th march",
    userEmp: 4,
    createdAt: new Date(),
  },
  {
    log: "Jason requested leave on 2th march",
    userEmp: 4,
    createdAt: new Date(),
  },
  {
    log: "Jason requested leave on 2th march",
    userEmp: 4,
    createdAt: new Date(),
  },
  {
    log: "Jason requested leave on 2th march",
    userEmp: 4,
    createdAt: new Date(),
  },
];

export function UserDetails({ user }: IUserDetails) {
  return (
    <div className="flex flex-col gap-10">
      <div className="flex items-center justify-between">
        <h1 className="text-[32px] font-semibold uppercase">
          {user.firstName} {user.lastName} (EMP-{user.employeeId})
        </h1>
        <StatusTag status={user.UserStatus?.statusLabel} />
      </div>
      <div className="flex flex-col gap-3">
        <h2>User Details</h2>
        <Detail label={"First Name"} value={user.firstName} />
        <Detail label={"Last Name"} value={user.lastName} />
        <Detail label={"Email"} value={user.email} />
      </div>

      <div className="flex flex-col gap-3">
        <h2>Most Recent User Logs</h2>
        {logs.map((log, i) => (
          <div key={i} className="flex flex-col gap-1 ">
            <div className="flex text-textSecondary font-semibold">
              <div className="w-2 h-2 bg-primary rounded-full" />
              <div className="text-sm ">{log.log}</div>
            </div>
            <div className="text-sm text-textSecondary">
              {log.createdAt.toDateString()}
            </div>
          </div>
        ))}
      </div>
      <div className="flex gap-3  w-full">
        {user.UserStatus?.statusLabel === "PENDING" && (
          <Button>
            <div className="flex gap-1 items-center">
              <CheckCircle size={14} /> Approve
            </div>
          </Button>
        )}
        <Button variant="secondary">
          <div className="flex gap-1 items-center">
            <Edit size={14} /> Edit
          </div>
        </Button>

        <Button variant="danger">
          <div className="flex gap-1 items-center">
            <Trash size={14} />
            Delete
          </div>
        </Button>
      </div>
    </div>
  );
}
