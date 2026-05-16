export type TWFHRequest = {
  id: number;
  userId: number;
  managerId: number;
  date: string;
  status: string;
  note?: string;
  requestType: "WORK_REMOTE" | "ATTENDANCE_APPROVAL";
  createdAt: string;
  updatedAt: string;
  user?: {
    firstName: string;
    lastName: string;
    email: string;
    employeeId: number;
  };
};
