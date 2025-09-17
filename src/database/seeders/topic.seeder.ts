import { DataSource } from "typeorm";
import { Topic } from "../../features/topic/entities/topic.entity";
import { Lesson } from "../../features/lesson/entities/lesson.entity";
import { DataSourceAwareSeed } from "./data-source-aware-seed";

interface TopicSeedData {
  title: string;
  description: string;
  lessonTitle: string;
}

export class TopicSeeder extends DataSourceAwareSeed {
  constructor(dataSource: DataSource) {
    super(dataSource);
  }

  async run(): Promise<void> {
    const topicRepository = this.dataSource.getRepository(Topic);
    const lessonRepository = this.dataSource.getRepository(Lesson);

    const topicsToSeed: TopicSeedData[] = [
      // Topics for "Introducción al Idioma Kamëntsá"
      { title: "Bienvenida", description: "Introducción general al curso y al idioma Kamëntsá.", lessonTitle: "Introducción al Idioma Kamëntsá" },
      { title: "Historia del Pueblo Kamëntsá", description: "Un vistazo a la historia y cultura del pueblo Kamëntsá.", lessonTitle: "Introducción al Idioma Kamëntsá" },

      // Topics for "Fonética y Pronunciación General"
      { title: "El Alfabeto Kamëntsá", description: "Presentación de las 32 letras del alfabeto Kamëntsá.", lessonTitle: "Fonética y Pronunciación General" },
      { title: "Las Vocales", description: "Estudio de las seis vocales del Kamëntsá.", lessonTitle: "Fonética y Pronunciación General" },
      { title: "Las Consonantes", description: "Estudio de las consonantes del Kamëntsá.", lessonTitle: "Fonética y Pronunciación General" },
      { title: "Patrones de Acentuación", description: "Reglas de acentuación y ritmo en el idioma.", lessonTitle: "Fonética y Pronunciación General" },

      // Topics for "Gramática General"
      { title: "Sustantivos y Clasificadores", description: "Introducción a los sustantivos y sus clasificadores.", lessonTitle: "Gramática General" },
      { title: "Pronombres Personales", description: "Uso de los pronombres personales.", lessonTitle: "Gramática General" },
      { title: "Verbos y Conjugaciones Básicas", description: "Introducción a los verbos y su conjugación en presente.", lessonTitle: "Gramática General" },
      { title: "Estructura de la Oración", description: "Cómo se construyen las oraciones básicas en Kamëntsá.", lessonTitle: "Gramática General" },

      // Topics for "Diccionario Bilingüe Kamëntsá"
      { title: "Saludos y Despedidas", description: "Vocabulario para saludar y despedirse.", lessonTitle: "Diccionario Bilingüe Kamëntsá" },
      { title: "La Familia", description: "Términos para los miembros de la familia.", lessonTitle: "Diccionario Bilingüe Kamëntsá" },
      { title: "Los Números", description: "Aprendizaje de los números en Kamëntsá.", lessonTitle: "Diccionario Bilingüe Kamëntsá" },
      { title: "Los Colores", description: "Vocabulario de los colores.", lessonTitle: "Diccionario Bilingüe Kamëntsá" },
      { title: "Animales Comunes", description: "Nombres de animales comunes en la región.", lessonTitle: "Diccionario Bilingüe Kamëntsá" },
      { title: "Comida y Bebida", description: "Vocabulario relacionado con la comida y la bebida.", lessonTitle: "Diccionario Bilingüe Kamëntsá" },

      // Topics for "Cuentos Tradicionales"
      { title: "Mitos de Creación", description: "Relatos sobre el origen del mundo y del pueblo Kamëntsá.", lessonTitle: "Cuentos Tradicionales" },
      { title: "Leyendas de Animales", description: "Historias y leyendas sobre animales de la región.", lessonTitle: "Cuentos Tradicionales" },

      // Fallback Topic required by VocabularySeeder
      { title: "Vocabulario General", description: "Vocabulario general y palabras sin una categoría específica.", lessonTitle: "Diccionario Bilingüe Kamëntsá" },
    ];

    for (const topicData of topicsToSeed) {
      const lesson = await lessonRepository.findOne({
        where: { title: topicData.lessonTitle },
      });

      if (!lesson) {
        console.warn(
          `[TopicSeeder] No se encontró la lección con título "${topicData.lessonTitle}". Saltando topic "${topicData.title}".`
        );
        continue;
      }

      const existingTopic = await topicRepository.findOne({
        where: {
          title: topicData.title,
          lesson: { id: lesson.id },
        },
      });

      if (existingTopic) {
        console.log(
          `[TopicSeeder] Topic "${topicData.title}" for Lesson "${topicData.lessonTitle}" already exists. Skipping.`
        );
        continue;
      }

      const topic = topicRepository.create({
        title: topicData.title,
        description: topicData.description,
        lesson: lesson,
      });

      try {
        await topicRepository.save(topic);
        console.log(
          `[TopicSeeder] Created topic: ${topic.title} for Lesson: ${lesson.title}`
        );
      } catch (error) {
        console.error(
          `[TopicSeeder] Error al guardar el topic "${topicData.title}" para la lección "${lesson.title}":`,
          error.message
        );
      }
    }
  }
}
