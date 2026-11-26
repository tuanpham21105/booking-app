import { UserRole } from '../../domain/enums/user-role.enum';

export class CreateUserDto {
  fullName: string;
  email: string;
  password: string;
  role?: UserRole;
}
