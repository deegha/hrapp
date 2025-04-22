import { serviceHandler } from "@/utils/serviceHandler";

type TCreateLeaveRequestResponse = {
  error: boolean;
  data: string;
};

export async function createLeaveRequest() {
  return await serviceHandler<TCreateLeaveRequestResponse>({
    method: "POST",
    baseURL: process.env.NEXT_PUBLIC_API as string,
    resource: "navigation",
  });
}
