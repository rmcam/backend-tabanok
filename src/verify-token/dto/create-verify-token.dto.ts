import { IsDateString, IsNotEmpty, IsString } from 'class-validator';

export class CreateVerifyTokenDto {
  @IsNotEmpty()
  @IsString()
  identifier: string;

  @IsNotEmpty()
  @IsString()
  token: string;

  @IsDateString()
  expires: Date;
}
