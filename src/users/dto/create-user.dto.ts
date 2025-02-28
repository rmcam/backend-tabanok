import { Transform } from 'class-transformer';
import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateUserDto {
  @IsString()
  firstName: string;

  @IsString()
  secondName: string;

  @IsString()
  firstLastName: string;

  @IsString()
  secondLastName: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(5)
  @MaxLength(255)
  @Transform(({ value }) => value?.trim())
  email: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  @MaxLength(255)
  @Transform(({ value }) => value?.trim())
  password: string;
}
