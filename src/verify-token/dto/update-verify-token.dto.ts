import { PartialType } from '@nestjs/swagger';
import { CreateVerifyTokenDto } from './create-verify-token.dto';

export class UpdateVerifyTokenDto extends PartialType(CreateVerifyTokenDto) {} //Deja opcionales los de createdto
