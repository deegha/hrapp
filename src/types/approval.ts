import {TGenericStatus} from "./api";

export type TApproval = {
  id: number;
  type: "USER" | "LEAVEREQUEST";
  title: string;
  status: TGenericStatus;
  targetId: number;
  createdAt: Date;
  updatedAt: Date;
};
