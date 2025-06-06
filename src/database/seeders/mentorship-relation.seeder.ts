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
        mentorUserEmail: 'admin@admin.com', // Usar email del usuario administrador
        studentUserEmail: 'student1@example.com', // Usar un email de prueba específico
        status: MentorshipStatus.ACTIVE,
        type: MentorshipType.DOCENTE_ESTUDIANTE,
        focusArea: SpecializationType.LENGUA,
        goals: [
          { description: 'Mejorar fluidez básica', isCompleted: false },
        ],
        sessions: [], // Sin sesiones iniciales
        progress: {
          currentLevel: 0,
          pointsEarned: 0,
          skillsLearned: [],
          lastAssessment: null,
        },
        startDate: new Date(),
        endDate: null, // Añadir endDate como null
        completionCertificate: null,
      },
      {
        mentorUserEmail: 'teacher@example.com', // Usar email del usuario profesor
        studentUserEmail: 'student2@example.com', // Usar un email de prueba específico
        status: MentorshipStatus.PENDING, // Estado pendiente
        type: MentorshipType.ESTUDIANTE_ESTUDIANTE,
        focusArea: SpecializationType.DANZA,
        goals: [
          { description: 'Aprender pasos básicos de danza', isCompleted: false },
        ],
        sessions: [],
        progress: {
          currentLevel: 0,
          pointsEarned: 0,
          skillsLearned: [],
          lastAssessment: null,
        },
        startDate: new Date(),
        endDate: null, // Añadir endDate como null
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
