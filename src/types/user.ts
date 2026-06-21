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
  departmentId?: number;
  isManager?: boolean;
  UserStatus: TUserStatus;
  EmploymentType?: {
    id: number;
    typeLabel: string;
  };
  Department?: {
    id: number;
    departmentName: string;
  };
  manager?: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
  };
  activityLogs?: {
    id: number;
    createdAt: string;
    content: string;
    userId: number;
    updatedAt: string;
  }[];
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
  joinDate?: string;
  salary?: number;
  nic?: string;
  epfNumber?: string;
  etfNumber?: string;
  dateOfBirth?: string;
  bankAccountNumber?: string;
  bank?: string;
};

export type TUpdateUser = {
  firstName: string;
  lastName: string;
  email: string;
  userLevel?: string;
  employmentTypeId?: number;
  joinDate?: string;
  salary?: number;
  nic?: string;
  epfNumber?: string;
  etfNumber?: string;
  dateOfBirth?: string;
  bankAccountNumber?: string;
  bank?: string;
};

export type TAllUserDetails = TUser & {
  joinDate: string;
  userInformation: {
    id: number;
    salary: number;
    userId: number;
    nic?: string | null;
    epfNumber?: string | null;
    etfNumber?: string | null;
    dateOfBirth?: string | null;
    bankAccountNumber?: string | null;
    bank?: string | null;
  } | null;
  documents?: {
    id: number;
    title: string;
    fileUrl: string;
    createdAt: string;
  }[];
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
  isManager: boolean;
};
export interface IUserSearchResult {
  employeeId: number | null;
  id: number;
  firstName: string;
  lastName: string;
  email: string;
}

export interface IMyDetails {
  firstName: string;
  lastName: string;
  employeeId: string;
}
