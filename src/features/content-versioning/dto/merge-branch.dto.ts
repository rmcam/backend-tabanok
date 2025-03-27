import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class MergeBranchDto {
    @ApiProperty({ description: 'ID de la versión de la rama a fusionar' })
    @IsString()
    @IsNotEmpty()
    branchVersionId: string;

    @ApiProperty({ description: 'ID de la versión objetivo para la fusión' })
    @IsString()
    @IsNotEmpty()
    targetVersionId: string;

    @ApiProperty({ description: 'Autor que realiza la fusión' })
    @IsString()
    @IsNotEmpty()
    author: string;
} 