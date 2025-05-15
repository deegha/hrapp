export type TUser = {
  firstName: string;
  lastName: string;
  email: string;
  employeeId: number;
  organizationId: number;
  createdAt: string;
  updatedAt: string;
  userStatusId: number;
  UserStatus: TUserStatus;
};

export type TUserStatus = {
  id: number;
  statusLabel: "PENDING" | "DEACTIVATED" | "DELETED" | "APPROVED";
};

export type TUserPermission = {
  id: number;
  permission: string;
};

export type TCreateUser = {
  firstName: string;
  lastName: string;
  email: string;
  userRole: string;
};

export type TUpdateUser = {
  firstName: string;
  lastName: string;
  email: string;
};

export type TAllUserDetails = TUser & {
  userInformation: {
    id: number;
    salary: number;
    userId: number;
  } | null;
  skills: {
    id: number;
    skillName: number;
  }[];
  teams: {
    id: number;
    teamName: string;
    division: number;
  }[];
};
