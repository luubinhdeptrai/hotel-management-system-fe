export type PaginationMeta = {
  page: number;
  limit: number;
  totalPages: number;
  totalItems: number;
};

export type SingleResponse<T> = {
  data: T;
};

export type PaginationResponse<T> = {
  data: T[];
  pagination: PaginationMeta;
};

export type StatusState = {
  isLoading: boolean;
  error: string | null;
  rendered: boolean;
};
