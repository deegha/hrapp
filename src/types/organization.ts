export type TLeaveType = {
  id: number;
  label: string;
  value: string;
  daysPerYear: number;
  isLieuLeave?: boolean;
};

import {EmploymentType} from "../constants/employmentTypes";

export type TLeavePolicy = {
  id: number;
  name: string;
  daysPerYear: number;
  accrualType: "ALL_FROM_DAY_1" | "HALF_DAY_PER_MONTH";
  canCarryForward: boolean;
  organizationId: number;
  daysPerEmploymentType?: Partial<Record<EmploymentType, number>>;
};

export type TUpdateLeavePolicyPayload = {
  id: number;
  name?: string;
  daysPerYear?: number;
  accrualType?: "ALL_FROM_DAY_1" | "HALF_DAY_PER_MONTH";
  canCarryForward?: boolean;
  daysPerEmploymentType?: Partial<Record<EmploymentType, number>>;
};

export type TCreateLeaveTypePayload = {
  name: string;
  daysPerYear: number;
  accrualType: "ALL_FROM_DAY_1" | "HALF_DAY_PER_MONTH";
  canCarryForward: boolean;
  daysPerEmploymentType?: Partial<Record<EmploymentType, number>>;
};
