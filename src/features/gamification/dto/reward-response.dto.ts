import { ApiProperty } from '@nestjs/swagger';
import { RewardTrigger, RewardType } from '../../../common/enums/reward.enum';

export class RewardResponseDto {
    @ApiProperty()
    id: string;

    @ApiProperty()
    name: string;

    @ApiProperty()
    description: string;

    @ApiProperty({ enum: RewardType })
    type: RewardType;

    @ApiProperty({ enum: RewardTrigger })
    trigger: RewardTrigger;

    @ApiProperty()
    conditions: { type: string; value: number; description: string }[];

    @ApiProperty()
    rewardValue: { type: string; value: any; metadata?: Record<string, any> };

    @ApiProperty()
    isActive: boolean;

    @ApiProperty()
    isLimited: boolean;

    @ApiProperty({ required: false })
    limitedQuantity?: number;

    @ApiProperty()
    timesAwarded: number;

    @ApiProperty({ required: false })
    startDate?: Date;

    @ApiProperty({ required: false })
    endDate?: Date;

    @ApiProperty()
    createdAt: Date;

    @ApiProperty()
    updatedAt: Date;
}
