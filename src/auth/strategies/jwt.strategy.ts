import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';
import { UserService } from '../../features/user/user.service'; // Importar UserService

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private userService: UserService, // Inyectar UserService
  ) {
    const jwtSecret = configService.get<string>('JWT_SECRET');

    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request) => {
          return request?.cookies?.accessToken;
        },
      ]),
      ignoreExpiration: false,
      secretOrKey: jwtSecret,
    });
  }

  async validate(payload: any) {
    console.log('JwtStrategy - Payload recibido:', payload);
    // Buscar el usuario en la base de datos
    const user = await this.userService.findOne(payload.sub);

    if (!user) {
      console.error('JwtStrategy - Usuario no encontrado para el ID:', payload.sub);
      throw new UnauthorizedException('Usuario no encontrado o token inválido');
    }

    console.log('JwtStrategy - Usuario validado:', user);
    // Retornar el objeto User completo si es necesario, o solo la información relevante
    return { id: user.id, email: user.email, roles: user.roles };
  }
}
