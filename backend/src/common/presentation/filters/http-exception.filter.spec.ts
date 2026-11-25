import {
  ArgumentsHost,
  BadRequestException,
  HttpException,
  HttpStatus,
  Logger,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { HttpExceptionFilter } from './http-exception.filter';
import type { ErrorMessageDto, ValidationErrorResponseDto } from '../dto';

class MockResponse {
  statusCode?: number;
  body?: unknown;

  status(code: number) {
    this.statusCode = code;
    return this;
  }

  json(data: unknown) {
    this.body = data;
    return this;
  }
}

describe('HttpExceptionFilter', () => {
  let filter: HttpExceptionFilter;
  let mockResponse: MockResponse;
  let mockRequest: {
    method: string;
    url: string;
  };
  let mockHost: ArgumentsHost;
  const originalDescriptor = Object.getOwnPropertyDescriptor(
    Logger.prototype,
    'error',
  );
  let loggedErrors: Array<{ message: unknown; stack?: string }> = [];

  beforeEach(() => {
    filter = new HttpExceptionFilter();
    mockResponse = new MockResponse();

    mockRequest = {
      method: 'POST',
      url: '/api/v1/auth/register',
    };

    mockHost = {
      switchToHttp: () => ({
        getResponse: () => mockResponse,
        getRequest: () => mockRequest,
      }),
    } as unknown as ArgumentsHost;

    loggedErrors = [];
    Logger.prototype.error = function (message: unknown, stack?: string) {
      loggedErrors.push({ message, stack });
    };
  });

  afterEach(() => {
    if (originalDescriptor) {
      Object.defineProperty(Logger.prototype, 'error', originalDescriptor);
    }
  });

  describe('HttpException handling', () => {
    it('should format standard HttpException with string message correctly', () => {
      const exception = new NotFoundException(
        'Không tìm thấy dịch vụ tương ứng với ID đã cung cấp',
      );

      filter.catch(exception, mockHost);

      expect(mockResponse.statusCode).toBe(HttpStatus.NOT_FOUND);
      const payload = mockResponse.body as ErrorMessageDto;
      expect(payload.statusCode).toBe(HttpStatus.NOT_FOUND);
      expect(payload.message).toBe(
        'Không tìm thấy dịch vụ tương ứng với ID đã cung cấp',
      );
      expect(payload.error).toBe('Not Found');
      expect(typeof payload.timestamp).toBe('string');
      expect(payload.path).toBe('/api/v1/auth/register');
    });

    it('should format validation errors with string array message matching ValidationErrorResponseDto', () => {
      const validationMessages = [
        'email must be an email',
        'password must be longer than or equal to 6 characters',
      ];
      const exception = new BadRequestException({
        statusCode: 400,
        message: validationMessages,
        error: 'Bad Request',
      });

      filter.catch(exception, mockHost);

      expect(mockResponse.statusCode).toBe(HttpStatus.BAD_REQUEST);
      const payload = mockResponse.body as ValidationErrorResponseDto;
      expect(payload.statusCode).toBe(HttpStatus.BAD_REQUEST);
      expect(payload.message).toEqual(validationMessages);
      expect(payload.error).toBe('Bad Request');
      expect(typeof payload.timestamp).toBe('string');
      expect(payload.path).toBe('/api/v1/auth/register');
    });

    it('should handle HttpException with string response body', () => {
      const exception = new HttpException('Direct string error', HttpStatus.FORBIDDEN);

      filter.catch(exception, mockHost);

      expect(mockResponse.statusCode).toBe(HttpStatus.FORBIDDEN);
      const payload = mockResponse.body as ErrorMessageDto;
      expect(payload.statusCode).toBe(HttpStatus.FORBIDDEN);
      expect(payload.message).toBe('Direct string error');
      expect(payload.error).toBe('Forbidden');
      expect(payload.path).toBe('/api/v1/auth/register');
    });

    it('should fallback to exception.message and status phrase when response object has no message or error', () => {
      const exception = new HttpException({}, HttpStatus.CONFLICT);

      filter.catch(exception, mockHost);

      expect(mockResponse.statusCode).toBe(HttpStatus.CONFLICT);
      const payload = mockResponse.body as ErrorMessageDto;
      expect(payload.statusCode).toBe(HttpStatus.CONFLICT);
      expect(payload.message).toBe(exception.message);
      expect(payload.error).toBe('Conflict');
    });

    it('should format ServiceUnavailableException correctly', () => {
      const exception = new ServiceUnavailableException('Database connection lost');

      filter.catch(exception, mockHost);

      expect(mockResponse.statusCode).toBe(HttpStatus.SERVICE_UNAVAILABLE);
      const payload = mockResponse.body as ErrorMessageDto;
      expect(payload.statusCode).toBe(HttpStatus.SERVICE_UNAVAILABLE);
      expect(payload.message).toBe('Database connection lost');
      expect(payload.error).toBe('Service Unavailable');
    });

    it('should fallback to Http Exception for unlisted status code', () => {
      const exception = new HttpException('Teapot error', 418);

      filter.catch(exception, mockHost);

      expect(mockResponse.statusCode).toBe(418);
      const payload = mockResponse.body as ErrorMessageDto;
      expect(payload.statusCode).toBe(418);
      expect(payload.message).toBe('Teapot error');
      expect(payload.error).toBe('Http Exception');
    });
  });

  describe('Unhandled / Non-HTTP errors handling', () => {
    it('should return 500, mask internal error message and log stack trace for generic Error', () => {
      const internalError = new Error('FATAL: PostgreSQL socket disconnected unexpectedly');

      filter.catch(internalError, mockHost);

      expect(mockResponse.statusCode).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
      const payload = mockResponse.body as ErrorMessageDto;
      expect(payload.statusCode).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
      expect(payload.message).toBe('Internal server error');
      expect(payload.error).toBe('Internal Server Error');
      expect(typeof payload.timestamp).toBe('string');
      expect(payload.path).toBe('/api/v1/auth/register');

      // Verify that sensitive internal error details are NEVER leaked in response
      expect(payload.message).not.toContain('PostgreSQL');

      // Verify logger logged the real error
      expect(loggedErrors.length).toBe(1);
      expect(String(loggedErrors[0].message)).toContain(
        'POST /api/v1/auth/register: FATAL: PostgreSQL socket disconnected unexpectedly',
      );
      expect(typeof loggedErrors[0].stack).toBe('string');
    });

    it('should handle non-Error thrown objects (e.g., string literal or null)', () => {
      filter.catch('Uncaught string rejection', mockHost);

      expect(mockResponse.statusCode).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
      const payload = mockResponse.body as ErrorMessageDto;
      expect(payload.statusCode).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
      expect(payload.message).toBe('Internal server error');
      expect(payload.error).toBe('Internal Server Error');

      expect(loggedErrors.length).toBe(1);
      expect(String(loggedErrors[0].message)).toContain('Uncaught string rejection');
      expect(loggedErrors[0].stack).toBeUndefined();
    });

    it('should gracefully handle undefined request properties', () => {
      const emptyHost = {
        switchToHttp: () => ({
          getResponse: () => mockResponse,
          getRequest: () => null,
        }),
      } as unknown as ArgumentsHost;

      filter.catch(new Error('Unexpected error with missing request'), emptyHost);

      expect(mockResponse.statusCode).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
      const payload = mockResponse.body as ErrorMessageDto;
      expect(payload.statusCode).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
      expect(payload.path).toBe('');
    });
  });
});
