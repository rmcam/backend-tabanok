import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from 'src/auth/auth.module';
import { User } from './entities/user.entity';
import { UserController } from './user.controller';

import { Account } from '../account/entities/account.entity';
import { UserService } from './user.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Account]), // Registra los repositorios de User y Account
    forwardRef(() => AuthModule), // Evita dependencias circulares con AuthModule
  ],
  controllers: [UserController],
  providers: [UserService], // Solo UserService debe estar aquí
  exports: [UserService, TypeOrmModule], // Exporta UserService y TypeOrmModule para que otros módulos puedan usarlos
})
export class UserModule {}