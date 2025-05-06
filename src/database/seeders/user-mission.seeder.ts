import { DataSource } from 'typeorm';
import { DataSourceAwareSeed } from './index';
import { UserMission } from '../../features/gamification/entities/user-mission.entity';

export default class UserMissionSeeder extends DataSourceAwareSeed {
  public constructor(dataSource: DataSource) {
    super(dataSource);
  }

  public async run(): Promise<void> {
    const repository = this.dataSource.getRepository(UserMission);

    const userMissions = [
      {
        user: { id: 'fictional-user-id-1' }, // Asociar a un usuario ficticio por ahora
        mission: { id: 'fictional-mission-id-1' }, // Asociar a una misión ficticia por ahora
      },
      {
        user: { id: 'fictional-user-id-1' }, // Asociar a un usuario ficticio por ahora
        mission: { id: 'fictional-mission-id-2' }, // Asociar a una misión ficticia por ahora
      },
      {
        user: { id: 'fictional-user-id-2' }, // Asociar a un usuario ficticio por ahora
        mission: { id: 'fictional-mission-id-1' }, // Asociar a una misión ficticia por ahora
      },
    ];

    const moreUserMissions = [
      {
        user: { id: 'fictional-user-id-3' },
        mission: { id: 'fictional-mission-id-3' },
      },
      {
        user: { id: 'fictional-user-id-3' },
        mission: { id: 'fictional-mission-id-4' },
      },
      {
        user: { id: 'fictional-user-id-4' },
        mission: { id: 'fictional-mission-id-1' },
      },
      {
        user: { id: 'fictional-user-id-4' },
        mission: { id: 'fictional-mission-id-5' },
      },
    ];

    userMissions.push(...moreUserMissions);

    // Nota: La asociación real entre User y Mission se manejará
    // en la lógica de la aplicación. Este seeder solo crea las entradas básicas.
    for (const userMissionData of userMissions) {
      const userMission = repository.create(userMissionData);
      await repository.save(userMission);
    }
  }
}
