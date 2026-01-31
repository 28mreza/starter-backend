import { Response } from 'express';

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  errors?: any;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
}

export class ResponseUtils {
  /**
   * Success response
   */
  static success<T>(res: Response, data: T, message: string = 'Success', statusCode: number = 200): Response {
    const response: ApiResponse<T> = {
      success: true,
      message,
      data
    };

    return res.status(statusCode).json(response);
  }

  /**
   * Error response
   */
  static error(res: Response, message: string = 'Error occurred', errors: any = null, statusCode: number = 400): Response {
    const response: ApiResponse = {
      success: false,
      message,
      errors
    };

    return res.status(statusCode).json(response);
  }

  /**
   * Paginated response
   */
  static paginated<T>(
    res: Response,
    data: T[],
    page: number,
    limit: number,
    total: number,
    message: string = 'Success'
  ): Response {
    const totalPages = Math.ceil(total / limit);

    const response: ApiResponse<T[]> = {
      success: true,
      message,
      data,
      meta: {
        page,
        limit,
        total,
        totalPages
      }
    };

    return res.status(200).json(response);
  }

  /**
   * Created response
   */
  static created<T>(res: Response, data: T, message: string = 'Resource created successfully'): Response {
    return this.success(res, data, message, 201);
  }

  /**
   * No content response
   */
  static noContent(res: Response): Response {
    return res.status(204).send();
  }

  /**
   * Unauthorized response
   */
  static unauthorized(res: Response, message: string = 'Unauthorized'): Response {
    return this.error(res, message, null, 401);
  }

  /**
   * Forbidden response
   */
  static forbidden(res: Response, message: string = 'Forbidden'): Response {
    return this.error(res, message, null, 403);
  }

  /**
   * Not found response
   */
  static notFound(res: Response, message: string = 'Resource not found'): Response {
    return this.error(res, message, null, 404);
  }

  /**
   * Validation error response
   */
  static validationError(res: Response, errors: any, message: string = 'Validation failed'): Response {
    return this.error(res, message, errors, 422);
  }

  /**
   * Internal server error response
   */
  static serverError(res: Response, message: string = 'Internal server error', error: any = null): Response {
    return this.error(res, message, error, 500);
  }
}
