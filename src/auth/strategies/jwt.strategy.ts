import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express'; // Importar Request
import { ExtractJwt, Strategy } from 'passport-jwt';

// Función para extraer el token de la cookie
const cookieExtractor = (req: Request): string | null => {
  let token = null;
  if (req && req.cookies) {
    token = req.cookies['access_token']; // Asume que la cookie se llama 'access_token'
  }
  console.log('Token extraído de la cookie:', token); // Log para depuración
  return token;
};

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService) {
    const jwtSecret = configService.get<string>('JWT_SECRET');

    super({
      // Usar extractores múltiples: primero cookie, luego header
      jwtFromRequest: ExtractJwt.fromExtractors([
        cookieExtractor,
        ExtractJwt.fromAuthHeaderAsBearerToken(),
      ]),
      ignoreExpiration: false,
      secretOrKey: jwtSecret,
    });
  }

  async validate(payload: any) {
    console.log('Payload del token (JWT Strategy):', payload);
    const user = {
      id: payload.sub,
      email: payload.email,
      roles: payload.roles,
    };
    console.log('Usuario validado (JWT Strategy):', user);
    return user;
  }
}
