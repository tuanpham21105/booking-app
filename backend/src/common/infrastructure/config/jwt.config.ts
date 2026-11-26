import { registerAs } from '@nestjs/config';

export interface JwtConfig {
  secret: string;
  expiresIn: string;
  refreshExpiresIn: string;
}

export const jwtConfig = registerAs<JwtConfig>('jwt', () => ({
  secret: process.env.JWT_SECRET || 'booking-app-jwt-secret-key-32-characters-min-safety',
  expiresIn: process.env.JWT_EXPIRES_IN || '15m',
  refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
}));
