export type TUser = {
  firstName: string;
  lastName: string;
  email: string;
  employeeId: number;
  organizationId: number;
  createdAt: string;
  updatedAt: string;
  userStatusId: number;
  employmentTypeId?: number;
  UserStatus: TUserStatus;
  EmploymentType?: {
    id: number;
    typeLabel: string;
  };
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
  employmentTypeId: number;
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
  userLevel: string;
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
