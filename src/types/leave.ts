export type TLeaves = {
  date: Date;
  half: "AM" | "PM" | null;
  leaveType: number;
};

export type LeaveResponse = {
  data: LeaveRequest[];
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
  createdAt: string;
  updatedAt: string;
  userId: number | null;
  leaveStatusId: number | null;
  leaveTypeId: number | null;
  LeaveStatus: {
    id: number;
    statusLabel: string;
  } | null;
};

export type Document = {
  id: number;
  leaveRequestId: number;
  fileUrl: string;
  createdAt: string;
};
