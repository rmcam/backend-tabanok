import { ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { Observable } from 'rxjs';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    // console.log(`JwtAuthGuard - URL: ${request.url}, Method: ${request.method}`);

    const isPublic = this.reflector.getAllAndOverride<boolean>('isPublic', [
      context.getHandler(),
      context.getClass(),
    ]);

    // console.log(`JwtAuthGuard - isPublic: ${isPublic}`);

    if (isPublic) {
      return true;
    }

    // Extraer token de la cookie si existe
    const accessToken = request.cookies['accessToken'];
    // console.log(`JwtAuthGuard - accessToken from cookie: ${accessToken}`);
    if (accessToken) {
      // Añadir el token al encabezado para que el guard base lo procese
      request.headers['authorization'] = `Bearer ${accessToken}`;
    }

    // console.log(`JwtAuthGuard - Authorization header: ${request.headers['authorization']}`);

    return super.canActivate(context);
  }
}
