import { DataSourceAwareSeed } from './data-source-aware-seed';
import { DataSource } from 'typeorm';
import { Lesson } from '../../features/lesson/entities/lesson.entity';
import { Unity } from '../../features/unity/entities/unity.entity';

export class FixLessonUnitySeeder extends DataSourceAwareSeed {
  constructor(dataSource: DataSource) {
    super(dataSource);
  }

  async run(): Promise<void> {
    const lessonRepository = this.dataSource.getRepository(Lesson);
    const unityRepository = this.dataSource.getRepository(Unity);

    const targetUnityId = '9b95ecc4-86cb-46f4-ac61-77524b3dea10'; // ID de la unidad problemática
    const targetUnity = await unityRepository.findOne({ where: { id: targetUnityId } });

    if (!targetUnity) {
      console.log(`Unity with ID ${targetUnityId} not found. Skipping FixLessonUnitySeeder.`);
      return;
    }

    console.log(`Attempting to associate lessons with Unity: "${targetUnity.title}" (ID: ${targetUnity.id})`);

    // Define some lesson titles to associate with the target unity
    const lessonTitlesToAssociate = [
      'Verbos Irregulares',
      'Cuentos Tradicionales',
      'Gramática Avanzada',
      'Fonemas Especiales',
      'Expresiones de Tiempo',
      'Direcciones y Lugares',
      'Festividades',
      'Biografías',
      'Saludos y Presentaciones',
      'Familia y Comunidad',
      'Comida y Naturaleza',
      'Colores y Formas',
      'Números y Cantidades',
      'Animales y Plantas Nativas',
      'El Cuerpo Humano',
      'Preguntas y Respuestas',
      'Expresión de Sentimientos',
      'La Música Kamëntsá',
      'Artesanía y Vestimenta',
      'Historia del Pueblo Kamëntsá',
    ];

    for (const title of lessonTitlesToAssociate) {
      let lesson = await lessonRepository.findOne({ where: { title: title } });

      if (lesson) {
        // If lesson exists, update its unityId
        if (lesson.unityId !== targetUnity.id) {
          lesson.unity = targetUnity;
          lesson.unityId = targetUnity.id;
          await lessonRepository.save(lesson);
          console.log(`Updated lesson "${lesson.title}" to associate with Unity "${targetUnity.title}".`);
        } else {
          console.log(`Lesson "${lesson.title}" is already associated with Unity "${targetUnity.title}".`);
        }
      } else {
        // If lesson does not exist, create it and associate with the target unity
        const newLesson = lessonRepository.create({
          title: title,
          description: `Descripción de la lección "${title}".`, // Generic description
          unity: targetUnity,
          unityId: targetUnity.id,
        });
        await lessonRepository.save(newLesson);
        console.log(`Created and associated new lesson "${newLesson.title}" with Unity "${targetUnity.title}".`);
      }
    }
    console.log('FixLessonUnitySeeder finished.');
  }
}
