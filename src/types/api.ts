export type TResponse<T> = {
  data: T;
  error: boolean;
};

export type TResponseWithPagination<T> = {
  data: {
    limit: number;
    page: number;
    total: number;
    totalPages: number;
    data: T;
  };
  error: boolean;
};

export type TGenericFilters = {
  limit?: number;
  page?: number;
};

export type TGenericStatus =
  | "PENDING"
  | "DEACTIVATED"
  | "DELETED"
  | "APPROVED"
  | "REJECTED";
