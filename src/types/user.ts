export type TUser = {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  organizationId: number;
  createdAt: string;
  updatedAt: string;
  userStatusId: number;
};

export type TUserStatus = {
  id: number;
  statusLabel: string;
};

export type TUserPermission = {
  id: number;
  permission: string;
};

export type TCreateUser = {
  firstName: string;
  lastName: string;
  email: string;
  statusId: number;
  userRole: string;
};
