import { registerAs } from '@nestjs/config';

export interface AdminConfig {
  name: string;
  email: string;
  password: string;
}

export const adminConfig = registerAs<AdminConfig>('admin', () => ({
  name: process.env.INITIAL_ADMIN_NAME ?? 'System Admin',
  email: process.env.INITIAL_ADMIN_EMAIL ?? 'admin@bookingapp.com',
  password: process.env.INITIAL_ADMIN_PASSWORD ?? 'AdminPassword123@',
}));
