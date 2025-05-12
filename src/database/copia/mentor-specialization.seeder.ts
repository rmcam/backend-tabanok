import { DataSourceAwareSeed } from './index';
import { DataSource } from 'typeorm';
import { MentorSpecialization, SpecializationType } from '../../features/gamification/entities/mentor-specialization.entity';
import { Mentor } from '../../features/gamification/entities/mentor.entity'; // Importar la entidad Mentor

export default class MentorSpecializationSeeder extends DataSourceAwareSeed {
  public constructor(dataSource: DataSource) {
    super(dataSource);
  }

  public async run(): Promise<void> {
    const repository = this.dataSource.getRepository(MentorSpecialization);
    const mentorRepository = this.dataSource.getRepository(Mentor); // Obtener el repositorio de Mentor

    const mentors = await mentorRepository.find(); // Obtener todos los mentores existentes

    if (mentors.length === 0) {
      console.log('No mentors found. Skipping MentorSpecializationSeeder.');
      return;
    }

    const specializations = [
      {
        type: SpecializationType.DANZA,
        level: 5,
        description: 'Experto en danzas tradicionales Kamëntsá.',
        certifications: [{ name: 'Certificado Danza Nivel 5', issuedBy: 'Comunidad Kamëntsá', date: new Date() }],
        endorsements: [],
      },
      {
        type: SpecializationType.LENGUA,
        level: 4,
        description: 'Dominio avanzado de la lengua Kamëntsá y su enseñanza.',
        certifications: [{ name: 'Certificado Lingüística Kamëntsá', issuedBy: 'Universidad Indígena', date: new Date() }],
        endorsements: [],
      },
      {
        type: SpecializationType.MEDICINA_TRADICIONAL,
        level: 5,
        description: 'Conocimiento profundo de plantas medicinales y prácticas curativas tradicionales.',
        certifications: [],
        endorsements: [],
      },
    ];

    const moreSpecializations = [
      {
        type: SpecializationType.MUSICA,
        level: 4,
        description: 'Habilidad en la interpretación de instrumentos musicales tradicionales.',
        certifications: [],
        endorsements: [{ name: 'Aval Comunidad Musical', issuedBy: 'Comunidad Kamëntsá', date: new Date() }],
      },
      {
        type: SpecializationType.HISTORIA_ORAL,
        level: 5,
        description: 'Amplio conocimiento de la historia y tradiciones del pueblo Kamëntsá.',
        certifications: [{ name: 'Diploma Historiador Local', issuedBy: 'Centro Cultural', date: new Date() }],
        endorsements: [],
      },
      {
        type: SpecializationType.ARTESANIA,
        level: 3,
        description: 'Conocimientos básicos en técnicas de tejido y cerámica.',
        certifications: [],
        endorsements: [],
      },
    ];

    specializations.push(...moreSpecializations);

    for (let i = 0; i < specializations.length; i++) {
      const specializationData = specializations[i];
      const selectedMentor = mentors[i % mentors.length]; // Seleccionar un mentor de forma rotatoria

      // Verificar si ya existe una especialización de este tipo para este mentor
      const existingSpecialization = await repository.findOne({
        where: {
          mentor: { id: selectedMentor.id },
          type: specializationData.type,
        },
        relations: ['mentor'], // Cargar la relación mentor
      });

      if (!existingSpecialization) {
        const specialization = repository.create({
          ...specializationData,
          mentor: selectedMentor, // Asociar la entidad Mentor
        });
        await repository.save(specialization);
        console.log(`Mentor Specialization "${specializationData.type}" seeded for mentor ID "${selectedMentor.id}".`);
      } else {
        console.log(`Mentor Specialization "${existingSpecialization.type}" already exists for mentor ID "${existingSpecialization.mentor.id}". Skipping.`);
      }
    }
  }
}
