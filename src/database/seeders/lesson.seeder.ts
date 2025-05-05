import { DataSourceAwareSeed } from './index';
import { DataSource } from 'typeorm';
import { Lesson } from '../../features/lesson/entities/lesson.entity';
import { Unity } from '../../features/unity/entities/unity.entity';

export class LessonSeeder extends DataSourceAwareSeed {
  constructor(dataSource: DataSource) {
    super(dataSource);
  }

  async run(): Promise<void> {
    const lessonRepository = this.dataSource.getRepository(Lesson);
    const unityRepository = this.dataSource.getRepository(Unity);

    const unities = await unityRepository.find();

    if (unities.length === 0) {
      console.log('No unities found. Skipping LessonSeeder.');
      return;
    }

    const lessonsToSeed = [
      { title: 'El Alfabeto Kamëntsá', description: 'Aprende las letras y sus sonidos.', unityTitle: 'Bienvenida y Alfabeto' },
      { title: 'Primeras Palabras', description: 'Introduce vocabulario básico.', unityTitle: 'Bienvenida y Alfabeto' },
      { title: 'Cómo Saludar', description: 'Frases comunes para saludar.', unityTitle: 'Saludos y Presentaciones' },
      { title: 'Presentándote a Ti Mismo', description: 'Cómo decir tu nombre y origen.', unityTitle: 'Saludos y Presentaciones' },
      // Agregar más lecciones para otras unidades
      { title: 'Las Vocales', description: 'Estudio de los sonidos vocálicos.', unityTitle: 'Vocales y Consonantes' },
      { title: 'Las Consonantes', description: 'Estudio de los sonidos consonánticos.', unityTitle: 'Vocales y Consonantes' },
    ];

    for (const lessonData of lessonsToSeed) {
      const existingLesson = await lessonRepository.findOne({ where: { title: lessonData.title } });

      if (!existingLesson) {
        const unity = unities.find(u => u.title === lessonData.unityTitle);
        if (unity) {
          const newLesson = lessonRepository.create({
            title: lessonData.title,
            description: lessonData.description,
            unity: unity,
            unityId: unity.id, // Asignar unityId
          });
          await lessonRepository.save(newLesson);
          console.log(`Lesson "${lessonData.title}" seeded.`);
        } else {
          console.log(`Unity "${lessonData.unityTitle}" not found for Lesson "${lessonData.title}". Skipping.`);
        }
      } else {
        console.log(`Lesson "${lessonData.title}" already exists. Skipping.`);
      }
    }
  }
}
