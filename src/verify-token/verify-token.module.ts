import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from 'src/auth/auth.module';
import { VerifyToken } from './entities/verifyToken.entity';
import { VerifyTokenController } from './verify-token.controller';
import { VerifyTokenService } from './verify-token.service';

@Module({
  imports: [TypeOrmModule.forFeature([VerifyToken])],
  controllers: [VerifyTokenController],
  providers: [VerifyTokenService],
  exports: [VerifyTokenService],
})
export class VerifyTokenModule {}
