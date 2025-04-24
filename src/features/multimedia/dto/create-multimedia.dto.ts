import { IsString, IsNotEmpty, IsOptional, IsNumber } from 'class-validator';

export class CreateMultimediaDto {
  @IsNotEmpty()
  @IsString()
  fileName: string;

  @IsNotEmpty()
  @IsString()
  filePath: string; // Or URL

  @IsNotEmpty()
  @IsString()
  fileType: string; // e.g., 'image', 'video', 'audio'

  @IsOptional()
  @IsString()
  mimeType?: string;

  @IsOptional()
  @IsNumber()
  size?: number;

  @IsOptional()
  @IsNumber()
  lessonId?: number; // Link to lesson if applicable

  // Add other relevant fields as needed
}
