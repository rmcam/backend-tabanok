import { IsBoolean, IsInt, IsOptional, IsString, Min } from 'class-validator';

export class CreateUnityDto {
  @IsString()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsInt()
  @Min(1)
  order: number;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
