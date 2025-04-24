import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RevokedToken } from '../entities/revoked-token.entity';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtRevokedGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    @InjectRepository(RevokedToken)
    private readonly revokedTokenRepository: Repository<RevokedToken>,
    private readonly configService: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = request.headers.authorization?.split(' ')[1];

    if (!token) {
      throw new UnauthorizedException('No se proporcionó token de autenticación');
    }

    const revokedToken = await this.revokedTokenRepository.findOne({ where: { token } });

    if (revokedToken) {
      throw new UnauthorizedException('Token revocado');
    }

    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: this.configService.get<string>('JWT_SECRET'),
      });
      request['user'] = payload;
    } catch (error) {
      throw new UnauthorizedException('Token inválido');
    }

    return true;
  }
}
