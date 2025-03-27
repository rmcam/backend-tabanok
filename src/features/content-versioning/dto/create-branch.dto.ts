import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateBranchDto {
    @ApiProperty({ description: 'Nombre de la nueva rama' })
    @IsString()
    @IsNotEmpty()
    branchName: string;

    @ApiProperty({ description: 'Autor que crea la rama' })
    @IsString()
    @IsNotEmpty()
    author: string;
} 