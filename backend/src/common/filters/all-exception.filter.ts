import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  PayloadTooLargeException,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { EntityNotFoundError, QueryFailedError } from 'typeorm';

type ErrorDetails = {
  statusCode: number;
  message: string | string[];
  error?: string;
};

type HttpErrorResponse = {
  statusCode?: number;
  message?: string | string[];
  error?: string;
};

type QueryFailedDriverError = Error & {
  code?: string;
};

@Catch()
export class AllExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const errorDetails = this.getErrorDetails(exception);

    response.status(errorDetails.statusCode).json({
      statusCode: errorDetails.statusCode,
      message: errorDetails.message,
      ...(errorDetails.error ? { error: errorDetails.error } : {}),
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }

  private getErrorDetails(exception: unknown): ErrorDetails {
    if (exception instanceof EntityNotFoundError) {
      return {
        statusCode: HttpStatus.NOT_FOUND,
        message: 'Entity not found.',
      };
    }

    if (this.isDuplicateError(exception)) {
      return {
        statusCode: HttpStatus.CONFLICT,
        message: 'Duplicate error.',
      };
    }

    if (exception instanceof PayloadTooLargeException) {
      return {
        statusCode: HttpStatus.PAYLOAD_TOO_LARGE,
        message: 'File is too large.',
      };
    }

    if (exception instanceof HttpException) {
      return this.getHttpExceptionDetails(exception);
    }

    return {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Internal server error.',
    };
  }

  private isDuplicateError(exception: unknown): boolean {
    if (!(exception instanceof QueryFailedError)) {
      return false;
    }

    const driverError = exception.driverError as QueryFailedDriverError;

    return driverError.code === '23505';
  }

  private getHttpExceptionDetails(exception: HttpException): ErrorDetails {
    const statusCode = exception.getStatus();
    const exceptionResponse = exception.getResponse();

    if (typeof exceptionResponse === 'string') {
      return {
        statusCode,
        message: exceptionResponse,
      };
    }

    const errorResponse = exceptionResponse as HttpErrorResponse;

    return {
      statusCode: errorResponse.statusCode ?? statusCode,
      message: errorResponse.message ?? exception.message,
      ...(errorResponse.error ? { error: errorResponse.error } : {}),
    };
  }
}
