// src/validations/userSchema.ts
import * as yup from "yup";

export const userSchema = yup.object({
  firstName: yup.string().required("First name is required"),
  lastName: yup.string().required("Last name is required"),
  email: yup.string().email("Invalid email").required("Email is required"),
  password: yup
    .string()
    .min(6, "Password must be at least 6 characters")
    .required("Password is required"),
  salary: yup
    .number()
    .typeError("Salary must be a number")
    .positive("Salary must be greater than 0")
    .required("Salary is required"),
  statusId: yup.number().required("Status is required"),
  userStatusId: yup.number().nullable(),
  userPermissions: yup
    .array()
    .of(yup.string())
    .min(1, "At least one permission must be selected"),
  userTeams: yup.array().of(yup.number()).min(1, "Select at least one team"),
});
