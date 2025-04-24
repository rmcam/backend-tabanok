import { ApiProperty } from '@nestjs/swagger';

export class FeaturedLessonDto {
  @ApiProperty({ description: 'Identificador único de la lección destacada' })
  id: string;

  @ApiProperty({ description: 'Título de la lección destacada' })
  title: string;

  @ApiProperty({ description: 'Descripción de la lección destacada', nullable: true })
  description: string;

  @ApiProperty({ description: 'Ruta de la imagen destacada de la lección' })
  imageSrc: string;
}
