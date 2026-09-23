/**
 * NestJS Common Utilities, DTO validation helpers, Interceptors & Exception Filters
 */

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  meta?: {
    total?: number;
    page?: number;
    limit?: number;
    totalPages?: number;
    timestamp?: string;
  };
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}

export class HttpException extends Error {
  constructor(public message: string, public status: number = 400, public code: string = 'BAD_REQUEST') {
    super(message);
    this.name = 'HttpException';
  }
}

export class NotFoundException extends HttpException {
  constructor(message = 'Resource not found') {
    super(message, 404, 'NOT_FOUND');
  }
}

export class ValidationException extends HttpException {
  constructor(message = 'Validation failed', public details?: any) {
    super(message, 422, 'VALIDATION_ERROR');
  }
}

export class UnauthorizedException extends HttpException {
  constructor(message = 'Unauthorized') {
    super(message, 401, 'UNAUTHORIZED');
  }
}

export class ForbiddenException extends HttpException {
  constructor(message = 'Forbidden resource') {
    super(message, 403, 'FORBIDDEN');
  }
}

/**
 * Standard Response Formatter conforming to Section 18
 */
export function formatSuccessResponse<T>(data: T, meta?: ApiResponse<T>['meta']): ApiResponse<T> {
  return {
    success: true,
    data,
    meta: {
      timestamp: new Date().toISOString(),
      ...meta,
    },
  };
}

export function formatErrorResponse(code: string, message: string, details?: any): ApiResponse<null> {
  return {
    success: false,
    error: {
      code,
      message,
      ...(details ? { details } : {}),
    },
  };
}
