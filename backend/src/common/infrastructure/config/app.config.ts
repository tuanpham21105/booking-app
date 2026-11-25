import { registerAs } from '@nestjs/config';

export interface AppConfig {
  nodeEnv: string;
  port: number;
}

export const appConfig = registerAs<AppConfig>('app', () => ({
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: parseInt(process.env.PORT ?? process.env.BACKEND_PORT ?? '3000', 10),
}));
