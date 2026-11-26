import { UserRole } from '../../domain/enums/user-role.enum';

export class UpdateUserDto {
  fullName?: string;
  email?: string;
  role?: UserRole;
}
