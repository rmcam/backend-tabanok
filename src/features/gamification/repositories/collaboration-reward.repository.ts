import { EntityRepository, Repository } from 'typeorm';
import { CollaborationReward } from '../entities/collaboration-reward.entity';

@EntityRepository(CollaborationReward)
export class CollaborationRewardRepository extends Repository<CollaborationReward> {}
