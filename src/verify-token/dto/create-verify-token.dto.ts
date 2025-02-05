import { IsDateString, IsNotEmpty, IsString } from 'class-validator';

export class CreateVerifyTokenDto {
  @IsNotEmpty()
  @IsString()
  email: string;

  @IsNotEmpty()
  @IsString()
  token: string;

  @IsDateString()
  expires: Date;
}
