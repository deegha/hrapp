export type TLeaveType = {
  id: number;
  label: string;
  value: string;
  daysPerYear: number;
  isLieuLeave?: boolean;
};

export type TLeavePolicy = {
  id: number;
  name: string;
  daysPerYear: number;
  accrualType: "ALL_FROM_DAY_1" | "HALF_DAY_PER_MONTH";
  canCarryForward: boolean;
  organizationId: number;
  daysPerEmploymentType?: Record<string, number>;
};

export type TUpdateLeavePolicyPayload = {
  id: number;
  name?: string;
  daysPerYear?: number;
  accrualType?: "ALL_FROM_DAY_1" | "HALF_DAY_PER_MONTH";
  canCarryForward?: boolean;
  daysPerEmploymentType?: Record<string, number>;
};

export type TCreateLeaveTypePayload = {
  name: string;
  daysPerYear: number;
  accrualType: "ALL_FROM_DAY_1" | "HALF_DAY_PER_MONTH";
  canCarryForward: boolean;
  daysPerEmploymentType?: Record<string, number>;
};

export type TEmploymentType = {
  id: number;
  typeLabel: string;
  organizationId: number | null;
  createdAt: string;
  updatedAt: string;
};

export type TCreateEmploymentTypePayload = {
  typeLabel: string;
};

export type TDepartment = {
  id: number;
  departmentName: string;
  organizationId: number;
  createdAt: string;
  updatedAt: string;
};

export type TCreateDepartmentPayload = {
  departmentName: string;
};

export type TUpdateDepartmentPayload = {
  departmentName: string;
};
