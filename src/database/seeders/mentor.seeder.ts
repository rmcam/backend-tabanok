import { v4 as uuidv4 } from 'uuid';
import { DataSourceAwareSeed } from './data-source-aware-seed';
import { DataSource } from 'typeorm';
import { Mentor, MentorLevel } from '../../features/gamification/entities/mentor.entity';
import { User } from '../../auth/entities/user.entity';
import * as fs from 'fs';
import * as path from 'path';

export class MentorSeeder extends DataSourceAwareSeed {
  public constructor(dataSource: DataSource) {
    super(dataSource);
  }

  public async run(): Promise<void> {
    const repository = this.dataSource.getRepository(Mentor);
    const userRepository = this.dataSource.getRepository(User);

    const mentorsJsonPath = path.resolve(__dirname, '../files/json/mentors.json');
    const mentorsJsonContent = JSON.parse(fs.readFileSync(mentorsJsonPath, 'utf-8'));

    for (const mentorData of mentorsJsonContent) {
      const user = await userRepository.findOne({ where: { email: mentorData.userEmail } });

      if (!user) {
        console.warn(`User with email "${mentorData.userEmail}" not found. Skipping mentor seeding for this user.`);
        continue;
      }

      const existingMentor = await repository.findOne({ where: { userId: user.id } });

      if (!existingMentor) {
        const mentor = repository.create({
          id: uuidv4(),
          userId: user.id,
          level: mentorData.level as MentorLevel,
          stats: mentorData.stats,
          availability: mentorData.availability,
          isActive: mentorData.isActive,
        });
        await repository.save(mentor);
        console.log(`Mentor seeded for user "${user.email}".`);
      } else {
        console.log(`Mentor already exists for user with ID "${existingMentor.userId}". Skipping.`);
      }
    }
  }
}
