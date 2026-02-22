import {TGenericStatus} from "./api";

export type TApproval = {
  id: number;
<<<<<<< HEAD
  type: "USER" | "LEAVEREQUEST" | "DEPARTMENT_ASSIGNMENT" | "USER_UPDATE"| "WFH_REQUEST";
=======
  type: "USER" | "LEAVEREQUEST" | "DEPARTMENT_ASSIGNMENT" | "USER_UPDATE";
>>>>>>> 51b54f53e13046d163b0f19226299bc6f58641bc
  title: string;
  status: TGenericStatus;
  targetId: number;
  data?: Record<string, unknown>; // JSON field for additional approval data
  createdAt: Date;
  updatedAt: Date;
};
