import { Module } from '@nestjs/common';
import { ContentService } from './content.service';
import { ContentController } from './content.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Content } from './entities/content.entity';
import { ContentRepository } from './content.repository';
import { AuthModule } from '../../auth/auth.module'; // Import AuthModule

@Module({
  imports: [
    TypeOrmModule.forFeature([Content]),
    AuthModule, // Import AuthModule
  ],
  controllers: [ContentController],
  providers: [ContentService, ContentRepository],
  exports: [ContentService, ContentRepository], // Exportar si se necesita en otros módulos
})
export class ContentModule {}
