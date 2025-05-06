import { DataSource } from 'typeorm';
import { DataSourceAwareSeed } from './index';
import { MentorshipRelation, MentorshipStatus, MentorshipType } from '../../features/gamification/entities/mentorship-relation.entity';
import { SpecializationType } from '../../features/gamification/entities/mentor-specialization.entity';

export default class MentorshipRelationSeeder extends DataSourceAwareSeed {
  public constructor(dataSource: DataSource) {
    super(dataSource);
  }

  public async run(): Promise<void> {
    const repository = this.dataSource.getRepository(MentorshipRelation);

    const now = new Date();
    const pastDate = new Date(now);
    pastDate.setDate(now.getDate() - 30);

    const relations = [
      {
        // mentor: 'fictional-mentor-id-1', // Asociar a un mentor ficticio por ahora
        studentId: 'fictional-user-id-3', // Asociar a un estudiante ficticio por ahora
        status: MentorshipStatus.ACTIVE,
        type: MentorshipType.DOCENTE_ESTUDIANTE,
        focusArea: SpecializationType.LENGUA,
        goals: [
          { description: 'Mejorar fluidez', isCompleted: false },
          { description: 'Aprender 100 palabras nuevas', isCompleted: true, completedAt: new Date() },
        ],
        sessions: [
          { date: pastDate, duration: 60, topic: 'Introducción', notes: 'Primera sesión', rating: 5 },
        ],
        progress: {
          currentLevel: 1,
          pointsEarned: 50,
          skillsLearned: ['Saludos'],
          lastAssessment: now,
        },
        startDate: pastDate,
        completionCertificate: null, // Añadir explicitamente completionCertificate
      },
      {
        // mentor: 'fictional-mentor-id-2', // Asociar a un mentor ficticio por ahora
        studentId: 'fictional-user-id-4', // Asociar a un estudiante ficticio por ahora
        status: MentorshipStatus.COMPLETED,
        type: MentorshipType.ESTUDIANTE_ESTUDIANTE,
        focusArea: SpecializationType.DANZA,
        goals: [
          { description: 'Aprender danza básica', isCompleted: true, completedAt: new Date() },
        ],
        sessions: [
          { date: pastDate, duration: 45, topic: 'Pasos básicos', notes: 'Sesión completada' },
        ],
        progress: {
          currentLevel: 2,
          pointsEarned: 100,
          skillsLearned: ['Paso 1', 'Paso 2'],
          lastAssessment: now,
        },
        startDate: pastDate,
        endDate: now,
        completionCertificate: 'certificate-url',
      },
      {
        // mentor: 'fictional-mentor-id-3',
        studentId: 'fictional-user-id-1',
        status: MentorshipStatus.ACTIVE,
        type: MentorshipType.DOCENTE_ESTUDIANTE,
        focusArea: SpecializationType.MUSICA,
        goals: [
          { description: 'Aprender a tocar un instrumento', isCompleted: false },
        ],
        sessions: [
          { date: pastDate, duration: 50, topic: 'Ritmo básico', notes: 'Buena práctica', rating: 4 },
        ],
        progress: {
          currentLevel: 1,
          pointsEarned: 30,
          skillsLearned: ['Ritmo'],
          lastAssessment: now,
        },
        startDate: pastDate,
        completionCertificate: null, // Añadir explicitamente completionCertificate
      },
      {
        // mentor: 'fictional-mentor-id-4',
        studentId: 'fictional-user-id-2',
        status: MentorshipStatus.CANCELLED,
        type: MentorshipType.ESTUDIANTE_ESTUDIANTE,
        focusArea: SpecializationType.HISTORIA_ORAL,
        goals: [
          { description: 'Investigar historia local', isCompleted: false },
        ],
        sessions: [
          { date: pastDate, duration: 30, topic: 'Fuentes históricas', notes: 'Sesión inicial' },
        ],
        progress: {
          currentLevel: 0,
          pointsEarned: 10,
          skillsLearned: [],
          lastAssessment: pastDate,
        },
        startDate: pastDate,
        endDate: new Date(pastDate.setDate(pastDate.getDate() + 7)), // Cancelada una semana después
        completionCertificate: null, // Añadir explicitamente completionCertificate
      },
    ];

    const moreRelations = [
      {
        // mentor: 'fictional-mentor-id-3',
        studentId: 'fictional-user-id-1',
        status: MentorshipStatus.ACTIVE,
        type: MentorshipType.DOCENTE_ESTUDIANTE,
        focusArea: SpecializationType.MUSICA,
        goals: [
          { description: 'Aprender a tocar un instrumento', isCompleted: false },
        ],
        sessions: [
          { date: pastDate, duration: 50, topic: 'Ritmo básico', notes: 'Buena práctica', rating: 4 },
        ],
        progress: {
          currentLevel: 1,
          pointsEarned: 30,
          skillsLearned: ['Ritmo'],
          lastAssessment: now,
        },
        startDate: pastDate,
        completionCertificate: null, // Añadir explicitamente completionCertificate
      },
      {
        // mentor: 'fictional-mentor-id-4',
        studentId: 'fictional-user-id-2',
        status: MentorshipStatus.CANCELLED,
        type: MentorshipType.ESTUDIANTE_ESTUDIANTE,
        focusArea: SpecializationType.HISTORIA_ORAL,
        goals: [
          { description: 'Investigar historia local', isCompleted: false },
        ],
        sessions: [
          { date: pastDate, duration: 30, topic: 'Fuentes históricas', notes: 'Sesión inicial' },
        ],
        progress: {
          currentLevel: 0,
          pointsEarned: 10,
          skillsLearned: [],
          lastAssessment: pastDate,
        },
        startDate: pastDate,
        endDate: new Date(pastDate.setDate(pastDate.getDate() + 7)), // Cancelada una semana después
        completionCertificate: null, // Añadir explicitamente completionCertificate
      },
    ];

    relations.push(...moreRelations);

    for (const relationData of relations) {
      const relation = repository.create(relationData);
      await repository.save(relation);
    }
  }
}
