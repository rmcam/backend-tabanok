import { IsString, IsOptional, IsNumber, IsJSON, IsNotEmpty } from 'class-validator';

export class CreateContentDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNotEmpty()
  @IsString()
  type: string; // e.g., 'text', 'video', 'quiz'

  @IsOptional()
  @IsJSON()
  content?: any; // El contenido real, puede ser JSON

  @IsNotEmpty()
  @IsNumber()
  unityId: number;

  @IsNotEmpty()
  @IsNumber()
  topicId: number;

  @IsOptional()
  @IsNumber()
  order?: number; // Orden dentro del tema
}
