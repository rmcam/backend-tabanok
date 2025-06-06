import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Multimedia } from './entities/multimedia.entity';
import { MultimediaController } from './multimedia.controller';
import { AuthModule } from '../../auth/auth.module';
import { MultimediaService } from './multimedia.service';

@Module({
  imports: [TypeOrmModule.forFeature([Multimedia]), AuthModule],
  controllers: [MultimediaController],
  providers: [MultimediaService],
  exports: [TypeOrmModule.forFeature([Multimedia]), MultimediaService], // Exportar MultimediaService
})
export class MultimediaModule {}
