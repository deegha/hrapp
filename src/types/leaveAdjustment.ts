export type TLeaveAdjustment = {
  id: number;
  userId: number;
  leaveTypeId: number;
  amount: number; // positive = credit, negative = debit
  reason: string;
  createdById: number;
  createdAt: string;
  expiresAt: string | null;
  leaveType: {id: number; leaveTypeLabel: string};
  createdBy: {id: number; firstName: string; lastName: string};
};

export type TLeaveBalance = {
  leaveTypeId: number;
  label: string;
  credited: number;
  taken: number;
  balance: number;
};

export type TLeaveAdjustmentsResponse = {
  adjustments: TLeaveAdjustment[];
  balances: TLeaveBalance[];
};

export type TCreateLeaveAdjustmentPayload = {
  leaveTypeId: number;
  days: number;
  type: "CREDIT" | "DEBIT";
  reason: string;
  expiresAt?: string; // ISO date string, undefined = never expires
};
