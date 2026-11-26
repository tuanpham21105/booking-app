import { AuthenticationRegistry, JwtBearerProvider, JwtClaims } from "@nestjs/authentication";
import { Injectable } from "@nestjs/common";
import { UsersService } from "../../../users";
import { AuthenticatedUserPayload } from "../dto/authentication-user-payload.dto";

@Injectable()
export class JwtService extends JwtBearerProvider<AuthenticatedUserPayload> {
    constructor (private readonly usersService: UsersService, registry: AuthenticationRegistry,) {
        super({ realm: 'my-app' });
        registry.registerProvider(this, { order: 0 });
    }

    async validate(payloads: JwtClaims): Promise<AuthenticatedUserPayload | null | undefined> {
        if (!payloads.sub) {
            return null;
        }

        const user = await this.usersService.findById(Number(payloads.sub));
        return {
            id: user.id,
            email: user.email,
            role: user.role
        };
    }

}