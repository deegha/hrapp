import { serviceHandler } from "@/utils/serviceHandler";
import { TResponseWithPagination, TApproval, TGenericFilters } from "@/types/";

export function approvalService(filters: TGenericFilters) {
  const limit = filters.limit;
  const page = filters.page;

  const response = serviceHandler<TResponseWithPagination<TApproval[]>>({
    method: "GET",
    baseURL: process.env.NEXT_PUBLIC_API as string,
    resource: `approval?page=${page}&limit=${limit}`,
  });

  return response;
}
