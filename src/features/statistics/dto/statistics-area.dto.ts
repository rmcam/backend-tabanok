import { ApiProperty } from '@nestjs/swagger';
import { Area } from '../interfaces/area.interface';
import { CategoryType, TrendType } from '../types/category.enum';

export class AreaDto implements Area {
    @ApiProperty({ enum: CategoryType })
    category: CategoryType;

    @ApiProperty()
    score: number;

    @ApiProperty()
    lastUpdated: string;

    @ApiProperty({ enum: TrendType })
    trend: TrendType;

    @ApiProperty({ type: [String] })
    recommendations: string[];

    constructor(data: Area) {
        this.category = data.category;
        this.score = data.score;
        this.lastUpdated = data.lastUpdated;
        this.trend = data.trend;
        this.recommendations = data.recommendations;
    }

    static fromArea(area: Area): AreaDto {
        return new AreaDto(area);
    }

    toArea(): Area {
        return {
            category: this.category,
            score: this.score,
            lastUpdated: this.lastUpdated,
            trend: this.trend,
            recommendations: this.recommendations
        };
    }
} 