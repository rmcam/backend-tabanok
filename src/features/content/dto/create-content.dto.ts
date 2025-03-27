import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsObject, IsString, IsUUID } from 'class-validator';

export class CreateContentDto {
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    title: string;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    description: string;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    type: string;

    @ApiProperty()
    @IsObject()
    @IsNotEmpty()
    data: Record<string, any>;

    @ApiProperty()
    @IsNumber()
    order: number;

    @ApiProperty()
    @IsUUID()
    @IsNotEmpty()
    lessonId: string;
} 