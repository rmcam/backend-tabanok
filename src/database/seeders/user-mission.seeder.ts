import { DataSource } from 'typeorm';
import { DataSourceAwareSeed } from './index';
import { UserMission } from '../../features/gamification/entities/user-mission.entity'; // Import UserMission
import { User } from '../../auth/entities/user.entity'; // Importar la entidad User
import { Mission } from '../../features/gamification/entities/mission.entity'; // Importar la entidad Mission

export default class UserMissionSeeder extends DataSourceAwareSeed {
  public constructor(dataSource: DataSource) {
    super(dataSource);
  }

  public async run(): Promise<void> {
    const userMissionRepository = this.dataSource.getRepository(UserMission);
    const userRepository = this.dataSource.getRepository(User); // Obtener el repositorio de User
    const missionRepository = this.dataSource.getRepository(Mission); // Obtener el repositorio de Mission

    // Obtener usuarios y misiones existentes
    const users = await userRepository.find();
    const missions = await missionRepository.find();

    if (users.length === 0 || missions.length === 0) {
        console.log('Skipping UserMissionSeeder: No users or missions found.');
        return;
    }

    const userMissionsToSeed: Partial<UserMission>[] = [];
    const now = new Date();

    // Create user mission records by iterating through users and assigning a subset of missions
    for (const user of users) {
        // Select a random subset of missions for each user
        const shuffledMissions = missions.sort(() => 0.5 - Math.random());
        const numberOfMissionsToAssign = Math.floor(Math.random() * Math.min(shuffledMissions.length, user.role === 'admin' ? 20 : user.role === 'teacher' ? 15 : 10)) + 1; // Assign more missions to active roles

        for (let i = 0; i < numberOfMissionsToAssign; i++) {
            const mission = shuffledMissions[i];

            // Create UserMission entity - only includes user and mission relationships
            userMissionsToSeed.push({
                user: user, // Associate User entity
                mission: mission, // Associate Mission entity
                // Removed status, progress, completedAt, assignedAt as they are not in UserMission entity
                // createdAt and updatedAt are likely handled automatically by TypeORM
            });
        }
    }

    // Use a single save call for efficiency
    await userMissionRepository.save(userMissionsToSeed);
    console.log(`Seeded ${userMissionsToSeed.length} user mission records.`);
    console.log('UserMission seeder finished.');
  }
}
