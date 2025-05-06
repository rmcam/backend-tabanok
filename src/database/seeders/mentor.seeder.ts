import { DataSource } from 'typeorm';
import { DataSourceAwareSeed } from './index';
import { Mentor, MentorLevel } from '../../features/gamification/entities/mentor.entity';

export default class MentorSeeder extends DataSourceAwareSeed {
  public constructor(dataSource: DataSource) {
    super(dataSource);
  }

  public async run(): Promise<void> {
    const repository = this.dataSource.getRepository(Mentor);

    const mentors = [
      {
        userId: 'fictional-user-id-1', // Asociar a un usuario ficticio por ahora
        level: MentorLevel.MAESTRO,
        stats: {
          sessionsCompleted: 50,
          studentsHelped: 20,
          averageRating: 4.8,
          culturalPointsAwarded: 500,
        },
        availability: {
          schedule: [{ day: 'Lunes', hours: ['10:00-12:00', '14:00-16:00'] }],
          maxStudents: 5,
        },
        achievements: ['achievement-id-1', 'achievement-id-5'],
        isActive: true,
      },
      {
        userId: 'fictional-user-id-2', // Asociar a un usuario ficticio por ahora
        level: MentorLevel.INTERMEDIO,
        stats: {
          sessionsCompleted: 10,
          studentsHelped: 5,
          averageRating: 4.0,
          culturalPointsAwarded: 100,
        },
        availability: {
          schedule: [{ day: 'Miércoles', hours: ['09:00-11:00'] }],
          maxStudents: 3,
        },
        achievements: ['achievement-id-2'],
        isActive: true,
      },
    ];

    const moreMentors = [
      {
        userId: 'fictional-user-id-3',
        level: MentorLevel.AVANZADO,
        stats: {
          sessionsCompleted: 25,
          studentsHelped: 10,
          averageRating: 4.5,
          culturalPointsAwarded: 250,
        },
        availability: {
          schedule: [{ day: 'Martes', hours: ['15:00-17:00'] }, { day: 'Jueves', hours: ['10:00-12:00'] }],
          maxStudents: 4,
        },
        achievements: ['achievement-id-3'],
        isActive: true,
      },
      {
        userId: 'fictional-user-id-4',
        level: MentorLevel.BASICO,
        stats: {
          sessionsCompleted: 5,
          studentsHelped: 2,
          averageRating: 3.9,
          culturalPointsAwarded: 50,
        },
        availability: {
          schedule: [{ day: 'Viernes', hours: ['11:00-13:00'] }],
          maxStudents: 2,
        },
        achievements: [],
        isActive: false, // Mentor inactivo
      },
    ];

    mentors.push(...moreMentors);

    for (const mentorData of mentors) {
      const mentor = repository.create(mentorData);
      await repository.save(mentor);
    }
  }
}
