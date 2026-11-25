import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import type { Request, Response } from 'express';

const HTTP_STATUS_NAMES: Record<number, string> = {
  400: 'Bad Request',
  401: 'Unauthorized',
  403: 'Forbidden',
  404: 'Not Found',
  409: 'Conflict',
  422: 'Unprocessable Entity',
  500: 'Internal Server Error',
  503: 'Service Unavailable',
};

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: string | string[] = 'Internal server error';
    let error = 'Internal Server Error';

    if (exception instanceof HttpException) {
      statusCode = exception.getStatus();
      const res = exception.getResponse();

      if (typeof res === 'object' && res !== null) {
        const resObj = res as Record<string, unknown>;
        if (Array.isArray(resObj['message'])) {
          message = resObj['message'].map((item) => String(item));
        } else if (typeof resObj['message'] === 'string') {
          message = resObj['message'];
        } else {
          message = exception.message;
        }

        if (
          typeof resObj['error'] === 'string' &&
          resObj['error'].trim().length > 0
        ) {
          error = resObj['error'];
        } else {
          error = HTTP_STATUS_NAMES[statusCode] ?? 'Http Exception';
        }
      } else if (typeof res === 'string') {
        message = res;
        error = HTTP_STATUS_NAMES[statusCode] ?? 'Http Exception';
      } else {
        message = exception.message;
        error = HTTP_STATUS_NAMES[statusCode] ?? 'Http Exception';
      }
    } else {
      const stack = exception instanceof Error ? exception.stack : undefined;
      const rawMessage =
        exception instanceof Error ? exception.message : String(exception);
      this.logger.error(
        `Unhandled error at ${request?.method ?? 'UNKNOWN'} ${request?.url ?? 'UNKNOWN'}: ${rawMessage}`,
        stack,
      );
    }

    response.status(statusCode).json({
      statusCode,
      message,
      error,
      timestamp: new Date().toISOString(),
      path: request?.url ?? '',
    });
  }
}
