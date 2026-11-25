export class ValidationErrorResponseDto {
  statusCode: number;
  message: string[];
  error: string;
  timestamp: string;
  path: string;
}
