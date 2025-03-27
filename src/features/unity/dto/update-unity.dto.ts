import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsBoolean, IsOptional } from 'class-validator';
import { CreateUnityDto } from './create-unity.dto';

export class UpdateUnityDto extends PartialType(CreateUnityDto) {
    @ApiProperty({
        description: 'Estado de activación de la unidad',
        example: true,
        required: false,
        type: Boolean,
    })
    @IsBoolean()
    @IsOptional()
    isActive?: boolean;
} 