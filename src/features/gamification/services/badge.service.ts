import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Badge } from '../entities/badge.entity';
import { Repository } from 'typeorm';
import { UserBadge } from '../entities/user-badge.entity';

@Injectable()
export class BadgeService {
  constructor(
    @InjectRepository(Badge)
    private readonly badgeRepository: Repository<Badge>,
    @InjectRepository(UserBadge)
    private readonly userBadgeRepository: Repository<UserBadge>,
  ) {}

  async getBadgesByUserId(userId: string): Promise<Badge[]> {
    const userBadges = await this.userBadgeRepository.find({
      where: {
        userId: userId,
      },
      relations: ['badge'],
    });

    return userBadges.map((userBadge) => userBadge.badge);
  }
}
