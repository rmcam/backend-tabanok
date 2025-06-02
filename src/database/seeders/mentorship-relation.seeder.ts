import { DataSource } from 'typeorm';
import { DataSourceAwareSeed } from './data-source-aware-seed';
import { MentorshipRelation, MentorshipStatus, MentorshipType } from '../../features/gamification/entities/mentorship-relation.entity';
import { Mentor } from '../../features/gamification/entities/mentor.entity';
import { User } from '../../auth/entities/user.entity';
import * as fs from 'fs';
import * as path from 'path';
import { SpecializationType } from '../../features/gamification/entities/mentor-specialization.entity';

export class MentorshipRelationSeeder extends DataSourceAwareSeed {
  public constructor(dataSource: DataSource) {
    super(dataSource);
  }

  async run(): Promise<void> {
    const repository = this.dataSource.getRepository(MentorshipRelation);
    const mentorRepository = this.dataSource.getRepository(Mentor);
    const userRepository = this.dataSource.getRepository(User);

    const mentorshipRelationsJsonPath = path.resolve(__dirname, '../files/json/mentorship_relations.json');
    const mentorshipRelationsJsonContent = JSON.parse(fs.readFileSync(mentorshipRelationsJsonPath, 'utf-8'));

    for (const relationData of mentorshipRelationsJsonContent) {
      const mentor = await mentorRepository.findOne({ where: { id: relationData.mentorId } });
      const student = await userRepository.findOne({ where: { email: relationData.studentEmail } });

      if (!mentor) {
        console.warn(`Mentor with ID "${relationData.mentorId}" not found. Skipping mentorship relation creation.`);
        continue;
      }

      if (!student) {
        console.warn(`Student with email "${relationData.studentEmail}" not found. Skipping mentorship relation creation.`);
        continue;
      }

      const existingRelation = await repository.findOne({
        where: {
          mentor: { id: mentor.id },
          studentId: student.id,
        },
      });

      if (!existingRelation) {
        const relation = repository.create({
          mentor: mentor,
          studentId: student.id,
          status: relationData.status as MentorshipStatus,
          type: relationData.type as MentorshipType,
          focusArea: relationData.focusArea as SpecializationType,
          goals: relationData.goals,
          sessions: relationData.sessions,
          progress: relationData.progress,
          startDate: new Date(relationData.startDate),
          endDate: relationData.endDate ? new Date(relationData.endDate) : null,
          completionCertificate: relationData.completionCertificate,
        });
        await repository.save(relation);
        console.log(`Mentorship relation seeded between mentor "${mentor.id}" and student "${student.email}".`);
      } else {
        console.log(`Mentorship relation already exists between mentor "${mentor.id}" and student "${student.email}". Skipping.`);
      }
    }
  }
}
