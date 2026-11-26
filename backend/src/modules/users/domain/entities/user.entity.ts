import { UserRole } from '../enums/user-role.enum';

/**
 * Domain User Entity thiết kế bằng TypeScript thuần,
 * độc lập hoàn toàn với framework và thư viện cơ sở dữ liệu.
 */
export class User {
  id?: number;
  fullName: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  createdAt?: Date;
  updatedAt?: Date;

  constructor(
    fullName: string,
    email: string,
    passwordHash: string,
    role: UserRole = UserRole.CUSTOMER,
    id?: number,
    createdAt?: Date,
    updatedAt?: Date,
  ) {
    this.fullName = fullName;
    this.email = email;
    this.passwordHash = passwordHash;
    this.role = role;
    this.id = id;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }
}
