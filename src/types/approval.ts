import { TGenericStatus } from "./api";

export type TApproval = {
  id: number;
  type: "USER" | "LEAVEREQUEST";
  status: TGenericStatus;
  targetId: number;
  createdAt: Date;
  updatedAt: Date;
};
