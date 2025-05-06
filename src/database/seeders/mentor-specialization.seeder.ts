import { DataSource } from 'typeorm';
import { DataSourceAwareSeed } from './index';
import { MentorSpecialization, SpecializationType } from '../../features/gamification/entities/mentor-specialization.entity';

export default class MentorSpecializationSeeder extends DataSourceAwareSeed {
  public constructor(dataSource: DataSource) {
    super(dataSource);
  }

  public async run(): Promise<void> {
    const repository = this.dataSource.getRepository(MentorSpecialization);

    const specializations = [
      {
        // mentor: 'fictional-mentor-id-1', // Asociar a un mentor ficticio por ahora
        type: SpecializationType.DANZA,
        level: 5,
        description: 'Experto en danzas tradicionales Kamëntsá.',
        certifications: [{ name: 'Certificado Danza Nivel 5', issuedBy: 'Comunidad Kamëntsá', date: new Date() }],
        endorsements: [],
      },
      {
        // mentor: 'fictional-mentor-id-2', // Asociar a un mentor ficticio por ahora
        type: SpecializationType.LENGUA,
        level: 4,
        description: 'Dominio avanzado de la lengua Kamëntsá y su enseñanza.',
        certifications: [{ name: 'Certificado Lingüística Kamëntsá', issuedBy: 'Universidad Indígena', date: new Date() }],
        endorsements: [],
      },
      {
        // mentor: 'fictional-mentor-id-1', // Asociar a un mentor ficticio por ahora
        type: SpecializationType.MEDICINA_TRADICIONAL,
        level: 5,
        description: 'Conocimiento profundo de plantas medicinales y prácticas curativas tradicionales.',
        certifications: [],
        endorsements: [],
      },
    ];

    const moreSpecializations = [
      {
        // mentor: 'fictional-mentor-id-3',
        type: SpecializationType.MUSICA,
        level: 4,
        description: 'Habilidad en la interpretación de instrumentos musicales tradicionales.',
        certifications: [],
        endorsements: [{ name: 'Aval Comunidad Musical', issuedBy: 'Comunidad Kamëntsá', date: new Date() }],
      },
      {
        // mentor: 'fictional-mentor-id-4',
        type: SpecializationType.HISTORIA_ORAL,
        level: 5,
        description: 'Amplio conocimiento de la historia y tradiciones del pueblo Kamëntsá.',
        certifications: [{ name: 'Diploma Historiador Local', issuedBy: 'Centro Cultural', date: new Date() }],
        endorsements: [],
      },
      {
        // mentor: 'fictional-mentor-id-2',
        type: SpecializationType.ARTESANIA,
        level: 3,
        description: 'Conocimientos básicos en técnicas de tejido y cerámica.',
        certifications: [],
        endorsements: [],
      },
    ];

    specializations.push(...moreSpecializations);

    for (const specializationData of specializations) {
      const specialization = repository.create(specializationData);
      await repository.save(specialization);
    }
  }
}
