import { DataSource } from 'typeorm';
import { DataSourceAwareSeed } from './index';
import { UserBadge } from '../../features/gamification/entities/user-badge.entity';

export default class UserBadgeSeeder extends DataSourceAwareSeed {
  public constructor(dataSource: DataSource) {
    super(dataSource);
  }

  public async run(): Promise<void> {
    const repository = this.dataSource.getRepository(UserBadge);

    const now = new Date();
    const pastDate = new Date(now);
    pastDate.setDate(now.getDate() - 10);

    const userBadges = [
      {
        userId: 'fictional-user-id-1', // Asociar a un usuario ficticio por ahora
        badgeId: 'fictional-badge-id-1', // Asociar a una insignia ficticia por ahora
        createdAt: pastDate,
      },
      {
        userId: 'fictional-user-id-1', // Asociar a un usuario ficticio por ahora
        badgeId: 'fictional-badge-id-2', // Asociar a una insignia ficticia por ahora
        createdAt: now,
      },
      {
        userId: 'fictional-user-id-2', // Asociar a un usuario ficticio por ahora
        badgeId: 'fictional-badge-id-1', // Asociar a una insignia ficticia por ahora
        createdAt: pastDate,
      },
    ];

    const moreUserBadges = [
      {
        userId: 'fictional-user-id-3',
        badgeId: 'fictional-badge-id-3',
        createdAt: pastDate,
      },
      {
        userId: 'fictional-user-id-3',
        badgeId: 'fictional-badge-id-4',
        createdAt: now,
      },
      {
        userId: 'fictional-user-id-4',
        badgeId: 'fictional-badge-id-1',
        createdAt: pastDate,
      },
      {
        userId: 'fictional-user-id-4',
        badgeId: 'fictional-badge-id-3',
        createdAt: now,
      },
    ];

    userBadges.push(...moreUserBadges);

    for (const userBadgeData of userBadges) {
      const userBadge = repository.create(userBadgeData);
      await repository.save(userBadge);
    }
  }
}
