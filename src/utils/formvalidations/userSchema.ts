import * as yup from "yup";

export const userSchema = yup.object({
  firstName: yup.string().required("First name is required"),
  lastName: yup.string().required("Last name is required"),
  email: yup.string().email("Invalid email").required("Email is required"),
  userStatusId: yup.number().required("Status is required"),
  userRole: yup.string().required("Role is required"),
});
