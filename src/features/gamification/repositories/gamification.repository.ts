import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Gamification } from '../entities/gamification.entity';

@Injectable()
export class GamificationRepository {
  constructor(
    @InjectRepository(Gamification)
    private readonly gamificationRepository: Repository<Gamification>,
  ) {}

  async findOne(userId: string): Promise<Gamification | undefined> {
    return this.gamificationRepository.findOne({ where: { userId } });
  }

  async save(gamification: Gamification): Promise<Gamification> {
    return this.gamificationRepository.save(gamification);
  }
}
