import { IsDate, IsEnum, IsNotEmpty, IsObject, IsString } from 'class-validator';
import { SeasonType } from '../entities/season.entity';

export class SeasonDto {
    @IsEnum(SeasonType)
    type: SeasonType;

    @IsString()
    @IsNotEmpty()
    name: string;

    @IsString()
    @IsNotEmpty()
    description: string;

    @IsDate()
    startDate: Date;

    @IsDate()
    endDate: Date;

    @IsObject()
    culturalElements: {
        traditions: string[];
        vocabulary: string[];
        stories: string[];
    };

    @IsObject()
    rewards: {
        points: number;
        specialBadge?: string;
        culturalItems?: string[];
    };
} 