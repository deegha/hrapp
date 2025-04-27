export type User = {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  statusId: number;
  organizationId: number;
  createdAt: string;
  updatedAt: string;
  userStatusId: number;
};

export type UserStatus = {
  id: number;
  statusLabel: string;
};

export type UserPermission = {
  id: number;
  permission: string;
};
