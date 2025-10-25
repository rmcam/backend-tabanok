import * as fs from 'fs';
import * as path from 'path';
import { DataSourceAwareSeed } from './data-source-aware-seed'; 
import { DataSource } from 'typeorm';
import { Lesson } from '../../features/lesson/entities/lesson.entity';
import { Unity } from '../../features/unity/entities/unity.entity'; // Revertir a Unity

export class LessonSeeder extends DataSourceAwareSeed {
  constructor(dataSource: DataSource) {
    super(dataSource);
  }

  async run(): Promise<void> {
    const lessonRepository = this.dataSource.getRepository(Lesson);
    const unityRepository = this.dataSource.getRepository(Unity); // Revertir a Unity

    const unities = await unityRepository.find();

    if (unities.length === 0) {
      console.log('No unities found. Skipping LessonSeeder.');
      return;
    }

    // Crear un mapa de unidades para búsqueda rápida por título
    const unityMap = new Map<string, Unity>();
    unities.forEach(unity => unityMap.set(unity.title, unity));

    const dictionaryPath = path.resolve(
      __dirname,
      '../files/json/consolidated_dictionary.json',
    );
    const dictionaryContent = JSON.parse(
      fs.readFileSync(dictionaryPath, 'utf-8'),
    );

    const sections = dictionaryContent.sections;
    const lessonsByUnity: {
      [unityTitle: string]: { title: string; description: string; order: number }[];
    } = {
      'Fundamentos del Kamëntsá': [
        { title: 'Introducción al Idioma Kamëntsá', description: 'Una introducción completa al idioma Kamëntsá, su historia, cultura y estructura básica.', order: 1 },
        { title: 'Generalidades del Idioma', description: 'Conceptos generales y contexto del idioma Kamëntsá.', order: 2 },
      ],
      'Los Sonidos del Kamëntsá': [
        { title: 'Fonética y Pronunciación General', description: 'Principios generales de la fonética y pronunciación en Kamëntsá.', order: 1 },
        { title: 'El Alfabeto Kamëntsá', description: 'Conoce las letras y símbolos del alfabeto Kamëntsá.', order: 2 },
        { title: 'Las Vocales del Kamëntsá', description: 'Estudio detallado de las vocales y su pronunciación.', order: 3 },
        { title: 'Las Consonantes del Kamëntsá', description: 'Estudio detallado de las consonantes y su pronunciación.', order: 4 },
        { title: 'Combinaciones Sonoras en Kamëntsá', description: 'Exploración de cómo se combinan los sonidos en Kamëntsá.', order: 5 },
        { title: 'Patrones de Acentuación en Kamëntsá', description: 'Reglas y ejemplos de acentuación en el idioma.', order: 6 },
        { title: 'Articulación Detallada de Sonidos', description: 'Profundización en la forma correcta de articular los sonidos.', order: 7 },
        { title: 'Guía de Pronunciación del Kamëntsá', description: 'Consejos y práctica para una pronunciación precisa.', order: 8 },
        { title: 'Variaciones Dialectales del Kamëntsá', description: 'Reconocimiento de las diferentes formas de hablar el Kamëntsá.', order: 9 },
        { title: 'Fonemas Especiales', description: 'Lección sobre sonidos y fonemas particulares del Kamëntsá.', order: 10 },
      ],
      'La Estructura de las Palabras': [
        { title: 'Gramática General', description: 'Conceptos fundamentales de la gramática Kamëntsá.', order: 1 },
        { title: 'Los Sustantivos en Kamëntsá', description: 'Estudio de los sustantivos, su uso y clasificación.', order: 2 },
        { title: 'El Número en Sustantivos Kamëntsá', description: 'Cómo expresar singular y plural en los sustantivos.', order: 3 },
        { title: 'Clasificadores Nominales en Kamëntsá', description: 'Uso de clasificadores para sustantivos.', order: 4 },
        { title: 'Los Pronombres en Kamëntsá', description: 'Tipos y uso de pronombres en Kamëntsá.', order: 5 },
        { title: 'Los Verbos en Kamëntsá', description: 'Conjugación y uso de los verbos.', order: 6 },
        { title: 'Gramática Avanzada', description: 'Lección sobre estructuras gramaticales más complejas.', order: 7 },
      ],
      'Construyendo tu Vocabulario': [
        { title: 'Diccionario Bilingüe Kamëntsá', description: 'Exploración del vocabulario Kamëntsá a través de categorías temáticas.', order: 1 },
        { title: 'Saludos y Despedidas', description: 'Aprende a saludar y despedirte en Kamëntsá.', order: 2 },
        { title: 'La Familia Kamëntsá', description: 'Términos de parentesco y estructura familiar.', order: 3 },
        { title: 'Comida Tradicional', description: 'Vocabulario relacionado con la gastronomía Kamëntsá.', order: 4 },
        { title: 'Colores en Kamëntsá', description: 'Aprende los nombres de los colores en Kamëntsá.', order: 5 },
        { title: 'Números en Kamëntsá', description: 'Conteo y uso de los números en el idioma.', order: 6 },
        { title: 'Animales Nativos', description: 'Vocabulario de animales de la región.', order: 7 },
      ],
      'Inmersión Cultural': [
        { title: 'Cuentos Tradicionales', description: 'Lección sobre cuentos y narraciones tradicionales en Kamëntsá.', order: 1 },
      ],
      'Herramientas para tu Aprendizaje': [
        { title: 'Recursos Adicionales para el Aprendizaje', description: 'Recursos complementarios, ejercicios prácticos y material multimedia.', order: 1 },
      ],
    };

    for (const unityTitle in lessonsByUnity) {
      const unity = unityMap.get(unityTitle);
      if (!unity) {
        console.warn(`Unity "${unityTitle}" not found. Skipping lessons for this unity.`);
        continue;
      }

      for (const lessonData of lessonsByUnity[unityTitle]) {
        const existingLesson = await lessonRepository.findOne({ where: { title: lessonData.title } });

        if (existingLesson) {
          // Si la lección ya existe, actualizar su descripción y orden
          existingLesson.description = lessonData.description;
          existingLesson.order = lessonData.order;
          existingLesson.unity = unity;
          existingLesson.unityId = unity.id;
          await lessonRepository.save(existingLesson);
          console.log(`Lesson "${lessonData.title}" updated with order ${lessonData.order}.`);
        } else {
          // Si la lección no existe, crearla
          const newLesson = lessonRepository.create({
            title: lessonData.title,
            description: lessonData.description,
            unity: unity,
            unityId: unity.id,
            order: lessonData.order,
          });
          await lessonRepository.save(newLesson);
          console.log(`Lesson "${lessonData.title}" seeded with order ${lessonData.order}.`);
        }
      }
    }
  }
}
