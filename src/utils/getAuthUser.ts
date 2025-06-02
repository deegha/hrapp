import {TUser} from "../types/user";
export async function getAuthUser() {
  const user = localStorage.getItem("user");

  return JSON.parse(user as string) as TUser;
}
