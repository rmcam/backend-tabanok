import { DataSourceAwareSeed } from './data-source-aware-seed';
import { DataSource } from 'typeorm';
import { Mentor, MentorLevel } from '../../features/gamification/entities/mentor.entity';
import { User } from '../../auth/entities/user.entity'; // Importar la entidad User

export class MentorSeeder extends DataSourceAwareSeed {
  public constructor(dataSource: DataSource) {
    super(dataSource);
  }

  public async run(): Promise<void> {
    const repository = this.dataSource.getRepository(Mentor);
    const userRepository = this.dataSource.getRepository(User); // Obtener el repositorio de User

    const users = await userRepository.find(); // Obtener todos los usuarios existentes

    if (users.length === 0) {
      console.log('No users found. Skipping MentorSeeder.');
      return;
    }

    // Mapear usuarios a un objeto para fácil acceso por email o índice
    const usersByEmail: { [key: string]: User } = {};
    const usersByIndex: User[] = [];
    users.forEach((user, index) => {
        usersByEmail[user.email] = user;
        usersByIndex[index] = user;
    });


    const mentorsData = [
      {
        userEmail: 'admin@admin.com', // Usar email para buscar el usuario real
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
        isActive: true,
      },
      {
        userEmail: 'teacher@example.com', // Usar email para buscar el usuario real
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
        isActive: true,
      },
      {
        userEmail: 'student1@example.com', // Usar un email de prueba específico
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
        isActive: true,
      },
      {
        userEmail: 'student2@example.com', // Usar un email de prueba específico
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
        isActive: false, // Mentor inactivo
      },
    ];


    for (const mentorData of mentorsData) {
      const realUser = usersByEmail[mentorData.userEmail];

      if (!realUser) {
        console.warn(`User with email "${mentorData.userEmail}" not found. Skipping mentor seeding for this user.`);
        continue; // Saltar si el usuario real no se encuentra
      }

      // Verificar si ya existe un mentor asociado a este usuario por userId
      const existingMentor = await repository.findOne({ where: { userId: realUser.id } });

      if (!existingMentor) {
        const mentor = repository.create({
          userId: realUser.id, // Asociar el userId real
          level: mentorData.level,
          stats: mentorData.stats,
          availability: mentorData.availability,
          isActive: mentorData.isActive,
        });
        await repository.save(mentor);
        console.log(`Mentor seeded for user "${realUser.email}".`);
      } else {
        console.log(`Mentor already exists for user with ID "${existingMentor.userId}". Skipping.`);
      }
    }
  }
}
