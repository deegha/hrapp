export type PayrollStatus = "PROCESSING" | "READY_FOR_REVIEW" | "APPROVED";

export type TPayrollSummary = {
  id: number;
  periodStart: string;
  periodEnd: string;
  status: PayrollStatus;
  totalAmount: number;
  createdAt: string;
  _count: {entries: number};
};

export type TPayrollEntry = {
  id: number;
  payrollId: number;
  userId: number;
  grossSalary: number;
  adjustedGross: number;
  epfEmployee: number;
  epfEmployer: number;
  etfEmployer: number;
  monthlyTax: number;
  netSalary: number;
  totalCost: number;
  workingDays: number;
  paidDays: number;
  leaveDays: number;
  isFlatSalary: boolean;
  note: string | null;
  user: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    employeeId: number | null;
    userInformation: {
      nic: string | null;
      bank: string | null;
      bankAccountNumber: string | null;
    } | null;
  } | null;
};

export type TPayroll = {
  id: number;
  periodStart: string;
  periodEnd: string;
  status: PayrollStatus;
  totalAmount: number;
  createdAt: string;
  entries: TPayrollEntry[];
};

export type TPayslipEntry = {
  id: number;
  payrollId: number;
  userId: number;
  grossSalary: number;
  adjustedGross: number;
  epfEmployee: number;
  epfEmployer: number;
  etfEmployer: number;
  monthlyTax: number;
  netSalary: number;
  totalCost: number;
  workingDays: number;
  paidDays: number;
  leaveDays: number;
  isFlatSalary: boolean;
  note: string | null;
  payroll: {id: number; periodStart: string; periodEnd: string; status: string};
};

export type TPayslipUser = {
  firstName: string;
  lastName: string;
  email: string;
  employeeId: number | null;
  organizationId: number;
  organization: {organizationName: string};
  userInformation: {
    position: string;
    bank: string | null;
    bankAccountNumber: string | null;
    epfNumber: string | null;
    nic: string | null;
  } | null;
  JobRole: {title: string} | null;
  Department: {departmentName: string} | null;
};

export type TPayslip = {
  entry: TPayslipEntry;
  user: TPayslipUser;
};

export type TPreflightResult = {
  canProceed: boolean;
  unapprovedLeaves: {
    user: {id: number; firstName: string; lastName: string; employeeId: number | null};
    count: number;
  }[];
  missingBankDetails: {
    id: number;
    firstName: string;
    lastName: string;
    employeeId: number | null;
  }[];
  blockedByApprovedPayroll?: {periodStart: string; periodEnd: string};
};
