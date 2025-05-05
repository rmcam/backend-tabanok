import { IsString, IsOptional, IsNumber, IsJSON, IsNotEmpty, IsUUID } from 'class-validator'; // Importar IsUUID

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
  @IsString() // Cambiar a IsString
  @IsUUID() // Agregar validación de UUID
  unityId: string; // Cambiar tipo a string

  @IsNotEmpty()
  @IsString() // Cambiar a IsString
  @IsUUID() // Agregar validación de UUID
  topicId: string; // Cambiar tipo a string

  @IsOptional()
  @IsNumber()
  order?: number; // Orden dentro del tema
}
