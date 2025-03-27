import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext) {
    // Para las pruebas, siempre retornamos true
    if (process.env.NODE_ENV === 'test') {
      return true;
    }
    return super.canActivate(context);
  }
} 