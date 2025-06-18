/**
 * Build standard success response object
 */
export const successResponse = (
  statusCode: number = 200,
  message: string,
  data: any = {}
) => {
  return {
    statusCode,
    success: true,
    message,
    data,
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
