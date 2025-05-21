import { ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { Observable } from 'rxjs';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    // console.log(`JwtAuthGuard - URL: ${request.url}, Method: ${request.method}`); // Añadir este log

    // Solución alternativa: omitir autenticación para la ruta /lesson/featured
    // Usar startsWith para manejar posibles parámetros de consulta

    const isPublic = this.reflector.getAllAndOverride<boolean>('isPublic', [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      // console.log('Acceso público permitido por decorador @Public');
      return true;
    }

    let authHeader = request.headers['authorization'];

    // Extraer token de la cookie si existe
    const accessToken = request.cookies['accessToken'];

    if (!authHeader && accessToken) {
      authHeader = `Bearer ${accessToken}`;
      request.headers['authorization'] = authHeader;
    }

    // console.log('Token en JwtAuthGuard:', request.headers.authorization);

    console.log('JwtAuthGuard - Llamando a super.canActivate(context)');
    let result = super.canActivate(context);
    if (result instanceof Observable) {
      result = result.toPromise();
    }
    try {
      result = await result;
      console.log('JwtAuthGuard - Resultado de super.canActivate(context):', result);
      return result;
    } catch (e) {
      console.error('JwtAuthGuard - Error en super.canActivate(context):', e);
      // Atrapar cualquier error de autenticación y lanzar UnauthorizedException
      throw new UnauthorizedException('Authentication failed');
    }
  }
}
