import * as fs from 'fs';
import * as path from 'path';
import { DataSourceAwareSeed } from './data-source-aware-seed'; 
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

    // Asegurarse de que la unidad con el ID específico del feedback exista o crear una lección para la primera unidad
    const targetUnityIdFromFeedback = '4632a61a-b85e-449a-a1f3-209d4635ea40';
    let targetUnity = await unityRepository.findOne({ where: { id: targetUnityIdFromFeedback } });

    if (!targetUnity && unities.length > 0) {
      // Si la unidad específica no existe, usar la primera unidad disponible
      targetUnity = unities[0];
      console.warn(`[LessonSeeder] Unidad con ID ${targetUnityIdFromFeedback} no encontrada. Usando la primera unidad disponible: "${targetUnity.title}" (${targetUnity.id}).`);
    } else if (!targetUnity) {
      console.error(`[LessonSeeder] No se pudo encontrar la unidad con ID ${targetUnityIdFromFeedback} ni ninguna otra unidad. No se pueden sembrar lecciones de prueba.`);
      return;
    }

    const dictionaryPath = path.resolve(
      __dirname,
      '../files/json/consolidated_dictionary.json',
    );
    const dictionaryContent = JSON.parse(
      fs.readFileSync(dictionaryPath, 'utf-8'),
    );

    const sections = dictionaryContent.sections;
    const lessonsToSeed = Object.keys(sections)
      .filter(sectionName => sectionName !== 'metadata' && sectionName !== 'search_config' && sectionName !== 'api_routes' && sectionName !== 'error_responses') // Excluir secciones de configuración/metadata
      .map(sectionName => {
        let description = `Contenido sobre ${sectionName}`;
        // Intentar obtener una descripción más detallada si está disponible
        if (sections[sectionName].content && sections[sectionName].content.descripcion) {
            description = sections[sectionName].content.descripcion;
        } else if (sections[sectionName].content && Array.isArray(sections[sectionName].content) && sections[sectionName].content.length > 0 && sections[sectionName].content[0].descripcion) {
             description = sections[sectionName].content[0].descripcion;
        }


        const unityMap: { [key: string]: string } = {
            'verbos': 'Tiempos Verbales Básicos',
            'saludos': 'Saludos y Presentaciones',
            'familia': 'Familia y Comunidad',
            'comida': 'Comida y Naturaleza',
            'colores': 'Colores y Formas',
            'numeros': 'Números y Cantidades',
            'animales': 'Animales y Plantas Nativas',
            'cuerpo_humano': 'El Cuerpo Humano',
            'preguntas': 'Conversación Cotidiana',
            'sentimientos': 'Expresión de Sentimientos',
            'musica': 'La Música Kamëntsá',
            'artesania': 'Artesanía y Vestimenta',
            'historia': 'Historia del Pueblo Kamëntsá',
        };

        let unityTitle = 'Contenido del Diccionario'; // Asociar a una unidad por defecto

        for (const key in unityMap) {
            if (sectionName.includes(key)) {
                unityTitle = unityMap[key];
                break;
            }
        }


        return {
          title: sectionName.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()), // Formatear nombre de sección como título
          description: description,
          unityTitle: unityTitle,
        };
      });

    // Añadir lecciones específicas requeridas por ExerciseSeeder y otras lecciones relevantes
    lessonsToSeed.push(
        { title: 'Verbos Irregulares', description: 'Lección sobre los verbos irregulares en Kamëntsá.', unityTitle: 'Tiempos Verbales Básicos' },
        { title: 'Cuentos Tradicionales', description: 'Lección sobre cuentos y narraciones tradicionales en Kamëntsá.', unityTitle: 'Vocabulario General' },
        { title: 'Gramática Avanzada', description: 'Lección sobre estructuras gramaticales más complejas.', unityTitle: 'Vocabulario General' },
        { title: 'Fonemas Especiales', description: 'Lección sobre sonidos y fonemas particulares del Kamëntsá.', unityTitle: 'Vocales y Consonantes' },
        { title: 'Expresiones de Tiempo', description: 'Lección sobre cómo expresar el tiempo en Kamëntsá.', unityTitle: 'Aspectos de la Vida Diaria' },
        { title: 'Direcciones y Lugares', description: 'Lección sobre cómo pedir y dar direcciones y nombres de lugares.', unityTitle: 'Aspectos de la Vida Diaria' },
        { title: 'Festividades', description: 'Lección sobre las principales festividades del pueblo Kamëntsá.', unityTitle: 'Vocabulario General' },
        { title: 'Biografías', description: 'Lección sobre personajes importantes en la historia Kamëntsá.', unityTitle: 'Historia del Pueblo Kamëntsá' },
    );

    // Añadir una lección de prueba explícita para la unidad objetivo
    if (targetUnity) {
      const testLessonTitle = 'Lección de Prueba para Frontend';
      const existingTestLesson = await lessonRepository.findOne({ where: { title: testLessonTitle, unityId: targetUnity.id } });

      if (!existingTestLesson) {
        const testLesson = lessonRepository.create({
          title: testLessonTitle,
          description: 'Esta es una lección de prueba para asegurar que el frontend reciba datos.',
          unity: targetUnity,
          unityId: targetUnity.id,
          order: 0, // Asegurar que aparezca primero
          isActive: true,
          isLocked: false,
          isCompleted: false,
          requiredPoints: 0,
          isFeatured: false,
        });
        await lessonRepository.save(testLesson);
        console.log(`[LessonSeeder] Lección de prueba "${testLessonTitle}" sembrada para la unidad "${targetUnity.title}" (${targetUnity.id}).`);
      } else {
        console.log(`[LessonSeeder] Lección de prueba "${testLessonTitle}" ya existe para la unidad "${targetUnity.title}" (${targetUnity.id}).`);
      }
    }

    for (const lessonData of lessonsToSeed) {
      const existingLesson = await lessonRepository.findOne({ where: { title: lessonData.title } });

      if (!existingLesson) {
        const unity = unities.find(u => u.title === lessonData.unityTitle);
        if (unity) {
          const newLesson = lessonRepository.create({
            title: lessonData.title,
            description: lessonData.description,
            unity: unity,
            unityId: unity.id,
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
