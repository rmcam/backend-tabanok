import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ArrayMinSize, IsArray, IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, Max, Min, ValidateNested } from 'class-validator';
import { MentorshipStatus } from '../entities/mentorship-relation.entity';
import { SpecializationType } from '../entities/mentor-specialization.entity';

export class CreateSpecializationDto {
    @IsEnum(SpecializationType)
    type: SpecializationType;

    @IsInt()
    @Min(1)
    @Max(5)
    level: number;

    @IsString()
    description: string;
}

export class CreateMentorDto {
    @IsString()
    userId: string;

    @IsArray()
    @ValidateNested({ each: true })
    @ArrayMinSize(1)
    @Type(() => CreateSpecializationDto)
    specializations: CreateSpecializationDto[];
}

export class AssignStudentDto {
    @IsString()
    studentId: string;

    @IsEnum(SpecializationType)
    focusArea: SpecializationType;
}

export class RecordSessionDto {
    @IsInt()
    @Min(15)
    duration: number;

    @IsString()
    topic: string;

    @IsString()
    notes: string;

    @IsOptional()
    @IsInt()
    @Min(1)
    @Max(5)
    rating?: number;

    @IsOptional()
    @IsString()
    feedback?: string;
}

export class UpdateAvailabilityDto {
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => ScheduleDto)
    schedule: ScheduleDto[];

    @IsInt()
    @Min(1)
    @Max(10)
    maxStudents: number;
}

class ScheduleDto {
    @IsString()
    day: string;

    @IsArray()
    @IsString({ each: true })
    hours: string[];
}

export class UpdateMentorshipStatusDto {
    @ApiProperty({
        description: 'Nuevo estado de la mentoría',
        enum: MentorshipStatus,
        example: MentorshipStatus.ACTIVE
    })
    @IsEnum(MentorshipStatus, { message: 'El estado debe ser un valor válido de MentorshipStatus' })
    @IsNotEmpty({ message: 'El estado no puede estar vacío' })
    status: MentorshipStatus;
}
