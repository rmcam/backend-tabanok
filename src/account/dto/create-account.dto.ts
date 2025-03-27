import { IsNotEmpty, IsString } from "class-validator";

export class CreateAccountDto {
    @IsNotEmpty()
    @IsString()
    email: string;
}
