// utils/pagination.ts

export interface PaginationParams {
  page: number;
  limit: number;
  skip: number;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const getPaginationParams = (query: any): PaginationParams => {
  const page = Math.max(1, parseInt(query.page)) || 1;
  const limit = Math.max(1, parseInt(query.limit)) || 10;
  const skip = (page - 1) * limit;

  return { page, limit, skip };
};

export const getPaginationMeta = (
  total: number,
  page: number,
  limit: number
): PaginationMeta => {
  return {
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
};
