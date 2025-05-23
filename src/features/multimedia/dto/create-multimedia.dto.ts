import { IsString, IsNotEmpty, IsOptional, IsNumber, IsUUID } from 'class-validator'; // Importar IsUUID
import { ApiProperty } from '@nestjs/swagger'; // Importar ApiProperty

export class CreateMultimediaDto {
  @ApiProperty({ description: 'Nombre original del archivo', example: 'audio_saludo.mp3' })
  @IsNotEmpty()
  @IsString()
  fileName: string;

  @ApiProperty({ description: 'Ruta o URL del archivo almacenado', example: 'uploads/audio_saludo.mp3' })
  @IsNotEmpty()
  @IsString()
  filePath: string; // Or URL

  @ApiProperty({ description: 'Tipo de archivo (imagen, video, audio)', example: 'audio' })
  @IsNotEmpty()
  @IsString()
  fileType: string; // e.g., 'image', 'video', 'audio'

  @ApiProperty({ description: 'Tipo MIME del archivo', example: 'audio/mpeg', required: false })
  @IsOptional()
  @IsString()
  mimeType?: string;

  @ApiProperty({ description: 'Tamaño del archivo en bytes', example: 50000, required: false })
  @IsOptional()
  @IsNumber()
  size?: number;

  @ApiProperty({ description: 'ID de la lección a la que se asocia el archivo (UUID)', example: '123e4567-e89b-12d3-a456-426614174000', required: false })
  @IsOptional()
  @IsUUID() // Asumiendo que lessonId es UUID
  lessonId?: string; // Cambiar a string

  @ApiProperty({ description: 'ID del usuario que subió el archivo (UUID)', example: 'f0e9d8c7-b6a5-4321-fedc-ba9876543210' })
  @IsNotEmpty()
  @IsString()
  @IsUUID() // Asumiendo que userId es UUID
  userId: string;

  // Add other relevant fields as needed
}
