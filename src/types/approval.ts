import {TGenericStatus} from "./api";

export type TApproval = {
  id: number;
  type: "USER" | "LEAVEREQUEST" | "DEPARTMENT_ASSIGNMENT";
  title: string;
  status: TGenericStatus;
  targetId: number;
  data?: Record<string, unknown>; // JSON field for additional approval data
  createdAt: Date;
  updatedAt: Date;
};
