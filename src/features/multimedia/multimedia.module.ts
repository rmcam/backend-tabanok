import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config'; // Importar ConfigModule
import { Multimedia } from './entities/multimedia.entity';
import { MultimediaController } from './multimedia.controller';
import { MultimediaService } from './multimedia.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Multimedia]),
    ConfigModule, // Importar ConfigModule
  ],
  controllers: [MultimediaController],
  providers: [MultimediaService],
  exports: [TypeOrmModule.forFeature([Multimedia]), MultimediaService], // Exportar MultimediaService
})
export class MultimediaModule {}
