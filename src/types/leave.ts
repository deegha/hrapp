import {TGenericStatus} from "./api";

export type TLeaves = {
  date: Date;
  half: "AM" | "PM" | null;
  leaveType: number;
  coveringDate?: Date;
};

export type LeaveResponse = {
  data: LeaveRequest[];
  currentPage: number;
  page: number;
  totalPages: number;
  total: number;
  pageSize: number;
};

export type LeaveRequest = {
  id: number;
  userId: number;
  note: string;
  status: number;
  createdAt: string;
  updatedAt: string;
  leaves: Leave[];
  documents: Document[];
};

export type Leave = {
  id: number;
  leaveRequestId: number;
  leaveDate: string;
  halfDay: "AM" | "PM" | null;
  leaveType: number;
  coveringDate: string | null;
  createdAt: string;
  updatedAt: string;
  userId: number | null;
  leaveStatusId: number | null;
  leaveTypeId: number | null;
  LeaveStatus: {
    id: number;
    statusLabel: TGenericStatus;
  };
};

export type Document = {
  id: number;
  leaveRequestId: number;
  fileUrl: string;
  createdAt: string;
};

export type LeaveRequestWithUser = LeaveRequest & {
  user?: {
    firstName: string;
    lastName: string;
    employeeId: number;
  };
};
