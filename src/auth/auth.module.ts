import { Module, forwardRef } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

import { AccountModule } from '../account/account.module';
import { UserModule } from '../user/user.module'; // Asegúrate de que la ruta sea correcta

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { jwtConstants } from './constants/jwt.constant';

@Module({
  imports: [
    forwardRef(() => UserModule), // Usa forwardRef para evitar dependencias circulares
    AccountModule,
    JwtModule.register({
      global: true,
      secret: jwtConstants.secret,
      signOptions: { expiresIn: '1d' },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService],
  exports: [JwtModule, AuthService], // Exporta AuthService si otros módulos lo necesitan
})
export class AuthModule {}