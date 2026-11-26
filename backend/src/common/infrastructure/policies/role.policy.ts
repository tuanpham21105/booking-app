// role.policy.ts
import { Policy } from '@nestjs/authorization';
import { AuthenticatedUserPayload } from '../../../modules/auth/application/dto/authentication-user-payload.dto';
import { UserRole } from '../../../modules/users';

@Policy()
export class RolePolicy {
  // allowedRoles được truyền từ decorator, không hard-code
  hasRole(user: AuthenticatedUserPayload | null, allowedRoles: UserRole[]) {
    return !!user && allowedRoles.some((role) => user.role === role);
  }
}