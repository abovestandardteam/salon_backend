/**
 * Build standard success response object
 */
import type { PaginationMeta } from "./pagination";

export const successResponse = (
  statusCode: number = 200,
  message: string,
  data: any = {},
  pagination?: PaginationMeta
) => {
  return {
    statusCode,
    success: true,
    message,
    data,
    ...(pagination && { pagination }),
  };
};

/**
 * Build standard error response object
 */
export const errorResponse = (statusCode: number = 500, message: any) => {
  return {
    statusCode,
    success: false,
    message,
  };
};
