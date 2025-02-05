import { IsEmail, IsString } from 'class-validator';

export class CreateUserDto {
  @IsString()
  firstName: string;

  @IsString()
  secondName: string;

  @IsString()
  firstLastName: string;

  @IsString()
  secondLastName: string;

  @IsEmail()
  email: string;
}
