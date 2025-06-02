import { DataSourceAwareSeed } from './data-source-aware-seed';
import { DataSource } from 'typeorm';
import { MentorSpecialization, SpecializationType } from '../../features/gamification/entities/mentor-specialization.entity';
import { Mentor } from '../../features/gamification/entities/mentor.entity';
import * as fs from 'fs';
import * as path from 'path';

export class MentorSpecializationSeeder extends DataSourceAwareSeed {
  public constructor(dataSource: DataSource) {
    super(dataSource);
  }

  public async run(): Promise<void> {
    const repository = this.dataSource.getRepository(MentorSpecialization);
    const mentorRepository = this.dataSource.getRepository(Mentor);

    const specializationsJsonPath = path.resolve(__dirname, '../files/json/mentor_specializations.json');
    const specializationsJsonContent = JSON.parse(fs.readFileSync(specializationsJsonPath, 'utf-8'));

    for (const specializationData of specializationsJsonContent) {
      const mentor = await mentorRepository.findOne({ where: { id: specializationData.mentorId } });

      if (!mentor) {
        console.warn(`Mentor with ID "${specializationData.mentorId}" not found for specialization "${specializationData.type}". Skipping.`);
        continue;
      }

      const existingSpecialization = await repository.findOne({
        where: {
          mentor: { id: mentor.id },
          type: specializationData.type as SpecializationType,
        },
      });

      if (!existingSpecialization) {
        const specialization = repository.create({
          mentor: mentor,
          type: specializationData.type as SpecializationType,
          level: specializationData.level,
          description: specializationData.description,
          certifications: specializationData.certifications.map((cert: any) => ({
            ...cert,
            date: new Date(cert.date),
          })),
          endorsements: specializationData.endorsements.map((endorsement: any) => ({
            ...endorsement,
            date: new Date(endorsement.date),
          })),
        });
        await repository.save(specialization);
        console.log(`Mentor Specialization "${specializationData.type}" seeded for mentor ID "${mentor.id}".`);
      } else {
        console.log(`Mentor Specialization "${existingSpecialization.type}" already exists for mentor ID "${mentor.id}". Skipping.`);
      }
    }
  }
}
