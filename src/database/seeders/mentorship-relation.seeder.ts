import { v4 as uuidv4 } from 'uuid';
import { DataSource } from 'typeorm';
import { DataSourceAwareSeed } from './data-source-aware-seed';
import { MentorshipRelation, MentorshipStatus, MentorshipType } from '../../features/gamification/entities/mentorship-relation.entity';
import { SpecializationType } from '../../features/gamification/entities/mentor-specialization.entity';
import { Mentor } from '../../features/gamification/entities/mentor.entity'; // Importar la entidad Mentor
import { User } from '../../auth/entities/user.entity'; // Importar la entidad User

export class MentorshipRelationSeeder extends DataSourceAwareSeed {
  public constructor(dataSource: DataSource) {
    super(dataSource);
  }

  public async run(): Promise<void> {
    const repository = this.dataSource.getRepository(MentorshipRelation);
    const mentorRepository = this.dataSource.getRepository(Mentor); // Obtener el repositorio de Mentor
    const userRepository = this.dataSource.getRepository(User); // Obtener el repositorio de User

    const mentors = await mentorRepository.find(); // Obtener todos los mentores existentes
    const users = await userRepository.find(); // Obtener todos los usuarios existentes

    if (mentors.length === 0 || users.length === 0) {
      console.log('No mentors or users found. Skipping MentorshipRelationSeeder.');
      return;
    }

    // Mapear usuarios a un objeto para fácil acceso por email o índice
    const usersByEmail: { [key: string]: User } = {};
    const usersByIndex: User[] = [];
    users.forEach((user, index) => {
        usersByEmail[user.email] = user;
        usersByIndex[index] = user;
    });

    // Mapear mentores a un objeto para fácil acceso por userId (asumiendo que userId es único para mentores)
    const mentorsByUserId: { [key: string]: Mentor } = {};
    mentors.forEach(mentor => {
        mentorsByUserId[mentor.userId] = mentor;
    });


    const relationsData = [
      {
        mentorUserEmail: 'admin@example.com', // Usar email del usuario asociado al mentor
        studentUserEmail: usersByIndex[0]?.email || 'user@example.com', // Usar email del primer usuario aleatorio o el usuario específico
        status: MentorshipStatus.ACTIVE,
        type: MentorshipType.DOCENTE_ESTUDIANTE,
        focusArea: SpecializationType.LENGUA,
        goals: [
          { description: 'Mejorar fluidez', isCompleted: false },
          { description: 'Aprender 100 palabras nuevas', isCompleted: true, completedAt: new Date() },
        ],
        sessions: [
          { date: new Date(new Date().setDate(new Date().getDate() - 30)), duration: 60, topic: 'Introducción', notes: 'Primera sesión', rating: 5 },
        ],
        progress: {
          currentLevel: 1,
          pointsEarned: 50,
          skillsLearned: ['Saludos'],
          lastAssessment: new Date(),
        },
        startDate: new Date(new Date().setDate(new Date().getDate() - 30)),
        completionCertificate: null,
      },
      {
        mentorUserEmail: 'teacher@example.com', // Usar email del usuario asociado al mentor
        studentUserEmail: usersByIndex[1]?.email || 'user@example.com', // Usar email del segundo usuario aleatorio o el usuario específico
        status: MentorshipStatus.COMPLETED,
        type: MentorshipType.ESTUDIANTE_ESTUDIANTE,
        focusArea: SpecializationType.DANZA,
        goals: [
          { description: 'Aprender danza básica', isCompleted: true, completedAt: new Date() },
        ],
        sessions: [
          { date: new Date(new Date().setDate(new Date().getDate() - 45)), duration: 45, topic: 'Pasos básicos', notes: 'Sesión completada' },
        ],
        progress: {
          currentLevel: 2,
          pointsEarned: 100,
          skillsLearned: ['Paso 1', 'Paso 2'],
          lastAssessment: new Date(),
        },
        startDate: new Date(new Date().setDate(new Date().getDate() - 45)),
        endDate: new Date(),
        completionCertificate: 'certificate-url',
      },
      {
        mentorUserEmail: usersByIndex[2]?.email || 'user@example.com', // Usar email del usuario asociado al mentor
        studentUserEmail: usersByIndex[3]?.email || 'user@example.com', // Usar email del cuarto usuario aleatorio o el usuario específico
        status: MentorshipStatus.ACTIVE,
        type: MentorshipType.DOCENTE_ESTUDIANTE,
        focusArea: SpecializationType.MUSICA,
        goals: [
          { description: 'Aprender a tocar un instrumento', isCompleted: false },
        ],
        sessions: [
          { date: new Date(new Date().setDate(new Date().getDate() - 20)), duration: 50, topic: 'Ritmo básico', notes: 'Buena práctica', rating: 4 },
        ],
        progress: {
          currentLevel: 1,
          pointsEarned: 30,
          skillsLearned: ['Ritmo'],
          lastAssessment: new Date(),
        },
        startDate: new Date(new Date().setDate(new Date().getDate() - 20)),
        completionCertificate: null,
      },
      {
        mentorUserEmail: usersByIndex[3]?.email || 'user@example.com', // Usar email del usuario asociado al mentor
        studentUserEmail: usersByIndex[0]?.email || 'user@example.com', // Usar email del primer usuario aleatorio o el usuario específico
        status: MentorshipStatus.CANCELLED,
        type: MentorshipType.ESTUDIANTE_ESTUDIANTE,
        focusArea: SpecializationType.HISTORIA_ORAL,
        goals: [
          { description: 'Investigar historia local', isCompleted: false },
        ],
        sessions: [
          { date: new Date(new Date().setDate(new Date().getDate() - 15)), duration: 30, topic: 'Fuentes históricas', notes: 'Sesión inicial' },
        ],
        progress: {
          currentLevel: 0,
          pointsEarned: 10,
          skillsLearned: [],
          lastAssessment: new Date(new Date().setDate(new Date().getDate() - 15)),
        },
        startDate: new Date(new Date().setDate(new Date().getDate() - 15)),
        endDate: new Date(new Date().setDate(new Date().getDate() - 8)), // Cancelada una semana después
        completionCertificate: null,
      },
    ];


    for (const relationData of relationsData) {
      const realMentorUser = usersByEmail[relationData.mentorUserEmail];
      const realStudentUser = usersByEmail[relationData.studentUserEmail];

      if (!realMentorUser) {
        console.warn(`Mentor user with email "${relationData.mentorUserEmail}" not found. Skipping mentorship relation seeding.`);
        continue;
      }

      if (!realStudentUser) {
        console.warn(`Student user with email "${relationData.studentUserEmail}" not found. Skipping mentorship relation seeding.`);
        continue;
      }

      const realMentor = mentorsByUserId[realMentorUser.id];

      if (!realMentor) {
           console.warn(`Mentor entity not found for user with email "${relationData.mentorUserEmail}". Skipping mentorship relation seeding.`);
           continue;
      }


      // Verificar si ya existe una relación entre este mentor y estudiante
      const existingRelation = await repository.findOne({
        where: {
          mentor: { id: realMentor.id }, // Verificar por ID del mentor
          studentId: realStudentUser.id, // Verificar por ID del estudiante
        },
      });

      if (!existingRelation) {
        const relation = repository.create({
          id: uuidv4(),
          mentor: realMentor, // Asociar la entidad Mentor real
          studentId: realStudentUser.id, // Asociar el ID del usuario real (estudiante)
          status: relationData.status,
          type: relationData.type,
          focusArea: relationData.focusArea,
          goals: relationData.goals,
          sessions: relationData.sessions,
          progress: relationData.progress,
          startDate: relationData.startDate,
          endDate: relationData.endDate,
          completionCertificate: relationData.completionCertificate,
        });
        await repository.save(relation);
        console.log(`Mentorship relation seeded between mentor "${realMentorUser.email}" and student "${realStudentUser.email}".`);
      } else {
        console.log(`Mentorship relation already exists between mentor "${realMentorUser.email}" and student "${realStudentUser.email}". Skipping.`);
      }
    }
  }
}
