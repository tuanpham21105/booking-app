import { UserRole } from "../../../users";

export class AuthenticatedUserPayload {
    id: number | undefined | null;
    email: string;
    role: UserRole
}