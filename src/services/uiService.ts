import { serviceHandler } from "@/utils/serviceHandler";
import { NavItem } from "@/types/ui";

type TNavItemResponse = {
  error: boolean;
  data: Array<NavItem>;
};

export async function getNavigationItems() {
  return await serviceHandler<TNavItemResponse>({
    method: "GET",
    baseURL: process.env.NEXT_PUBLIC_API as string,
    resource: "navigation",
  });
}
