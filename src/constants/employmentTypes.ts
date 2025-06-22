export const EMPLOYMENT_TYPES = {
  FULLTIME: "FULLTIME",
  PROBATION: "PROBATION",
  INTERN: "INTERN",
} as const;

export const EMPLOYMENT_TYPE_VALUES = Object.values(EMPLOYMENT_TYPES);

export type EmploymentType = (typeof EMPLOYMENT_TYPES)[keyof typeof EMPLOYMENT_TYPES];
