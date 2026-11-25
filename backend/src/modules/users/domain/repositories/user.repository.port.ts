import { User } from '../entities/user.entity';
import { UserRole } from '../enums/user-role.enum';

/**
 * Cổng giao tiếp Repository (Abstract Class Port) trong tầng Domain.
 * Sử dụng TypeScript thuần, các tham số đầu vào được truyền độc lập trực tiếp,
 * không bọc trong interface hay class (kể cả page và limit nhận từ endpoint).
 */
export abstract class UserRepository {
  abstract findById(id: number): Promise<User | null>;
  abstract findByEmail(email: string): Promise<User | null>;
  abstract findAll(page?: number, limit?: number): Promise<[User[], number]>;
  abstract create(
    fullName: string,
    email: string,
    passwordHash: string,
    role?: UserRole,
  ): Promise<User>;
  abstract update(
    id: number,
    fullName?: string,
    passwordHash?: string,
    role?: UserRole,
  ): Promise<User | null>;
  abstract delete(id: number): Promise<boolean>;
  abstract save(user: User): Promise<User>;
}
