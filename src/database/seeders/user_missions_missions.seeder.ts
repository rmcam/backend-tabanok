import { DataSource } from 'typeorm';
import { DataSourceAwareSeed } from './data-source-aware-seed';
import { UserMission } from '../../features/gamification/entities/user-mission.entity';
import { Mission } from '../../features/gamification/entities/mission.entity';
import { randomInt } from 'crypto';

export class UserMissionsMissionsSeeder extends DataSourceAwareSeed {
    constructor(dataSource: DataSource) {
        super(dataSource);
    }

    async run(): Promise<void> {
        console.log('Running UserMissionsMissionsSeeder...');
        const userMissionRepository = this.dataSource.getRepository(UserMission);
        const missionRepository = this.dataSource.getRepository(Mission);

        const userMissions = await userMissionRepository.find();
        const missions = await missionRepository.find();

        if (userMissions.length === 0 || missions.length === 0) {
            console.warn('No userMissions or missions found. Skipping UserMissionsMissionsSeeder.');
            return;
        }

        // Solo sembrar datos de prueba en entornos que no sean producción
        if (process.env.NODE_ENV !== 'production') {
            const queryRunner = this.dataSource.createQueryRunner();
            await queryRunner.connect();
            await queryRunner.startTransaction();

            try {
                for (const userMission of userMissions) {
                    // Link each userMission to a random number of missions (e.g., 1 to 3)
                    const numberOfMissionsToLink = randomInt(1, 4); // 1 to 3 inclusive
                    const linkedMissionIds: string[] = [];

                    for (let i = 0; i < numberOfMissionsToLink; i++) {
                        // Select a random mission that hasn't been linked to this userMission yet
                        let randomMission: Mission | undefined;
                        let attempts = 0;
                        do {
                            const randomIndex = randomInt(0, missions.length);
                            randomMission = missions[randomIndex];
                            attempts++;
                        } while (linkedMissionIds.includes(randomMission.id.toString()) && attempts < 10); // Avoid infinite loop

                        if (randomMission) {
                            // Verificar si la relación ya existe
                            const existingRelation = await queryRunner.query(
                                `SELECT 1 FROM "user_missions_missions" WHERE "userMissionsId" = $1 AND "missionsId" = $2`,
                                [userMission.id, randomMission.id]
                            );

                            if (existingRelation.length === 0) {
                                await queryRunner.query(
                                    `INSERT INTO "user_missions_missions" ("userMissionsId", "missionsId") VALUES ($1, $2)`,
                                    [userMission.id, randomMission.id]
                                );
                                linkedMissionIds.push(randomMission.id);
                                console.log(`Linked UserMission ID ${userMission.id} with Mission ID ${randomMission.id}`);
                            } else {
                                console.log(`Relation between UserMission ID ${userMission.id} and Mission ID ${randomMission.id} already exists. Skipping.`);
                            }
                        } else if (attempts >= 10) {
                            console.warn(`Could not find a unique mission to link to UserMission ID ${userMission.id} after 10 attempts.`);
                        }
                    }
                }

                await queryRunner.commitTransaction();
                console.log('UserMissionsMissions seeding complete (development environment).');

            } catch (error) {
                await queryRunner.rollbackTransaction();
                console.error('UserMissionsMissions seeding failed. Transaction rolled back.', error);
                throw error;
            } finally {
                await queryRunner.release();
            }
        } else {
            console.log('Skipping UserMissionsMissionsSeeder in production environment.');
        }
    }
}
