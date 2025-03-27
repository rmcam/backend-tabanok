import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
    constructor(
        private jwtService: JwtService,
        private configService: ConfigService
    ) { }

    async generateToken(user: any) {
        const payload = {
            sub: user.id,
            email: user.email,
            roles: user.roles
        };

        return {
            access_token: this.jwtService.sign(payload, {
                secret: this.configService.get<string>('JWT_SECRET'),
                expiresIn: this.configService.get<string>('JWT_EXPIRATION_TIME')
            })
        };
    }

    async verifyToken(token: string) {
        try {
            const payload = await this.jwtService.verifyAsync(token, {
                secret: this.configService.get<string>('JWT_SECRET')
            });
            return payload;
        } catch (error) {
            return null;
        }
    }

    async decodeToken(token: string) {
        try {
            return this.jwtService.decode(token);
        } catch (error) {
            return null;
        }
    }
} 