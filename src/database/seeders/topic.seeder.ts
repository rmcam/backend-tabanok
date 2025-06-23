import { DataSource } from "typeorm";
import { Topic } from "../../features/topic/entities/topic.entity";
import { Lesson } from "../../features/lesson/entities/lesson.entity"; // Cambiar a Lesson
import { DataSourceAwareSeed } from "./data-source-aware-seed";

interface TopicSeedData {
  title: string;
  description: string;
  lessonTitle: string; // Cambiar a lessonTitle
}

export class TopicSeeder extends DataSourceAwareSeed {
  constructor(dataSource: DataSource) {
    super(dataSource);
  }

  async run(): Promise<void> {
    const topicRepository = this.dataSource.getRepository(Topic);
    const lessonRepository = this.dataSource.getRepository(Lesson); // Cambiar a LessonRepository

    // Define los tópicos que el ContentSeeder espera
    const topicsToSeed: TopicSeedData[] = [
      { title: "General", description: "Contenido general e introductorio del idioma Kamëntsá.", lessonTitle: "Introducción al Idioma Kamëntsá" },
      { title: "Fonética y Pronunciación", description: "Estudio de los sonidos, alfabeto, articulación y variaciones dialectales del Kamëntsá.", lessonTitle: "Fonética y Pronunciación General" },
      { title: "Gramática Básica", description: "Conceptos fundamentales de la gramática Kamëntsá, incluyendo sustantivos, verbos y pronombres.", lessonTitle: "Gramática General" },
      { title: "Vocabulario General", description: "Entradas del diccionario Kamëntsá-Español y Español-Kamëntsá sin una categoría específica.", lessonTitle: "Diccionario Bilingüe Kamëntsá" },
      { title: "Recursos Adicionales", description: "Material complementario y referencias para el aprendizaje del Kamëntsá.", lessonTitle: "Recursos Adicionales para el Aprendizaje" },
      { title: "Alfabeto", description: "Detalles sobre el alfabeto Kamëntsá y sus letras.", lessonTitle: "El Alfabeto Kamëntsá" },
      { title: "Sustantivos", description: "Información sobre sustantivos y clasificadores nominales en Kamëntsá.", lessonTitle: "Los Sustantivos en Kamëntsá" },
      { title: "Pronombres", description: "Detalles sobre los pronombres personales en Kamëntsá.", lessonTitle: "Los Pronombres en Kamëntsá" },
      { title: "Verbos", description: "Conjugación y uso de verbos en Kamëntsá.", lessonTitle: "Los Verbos en Kamëntsá" },
      { title: "Clasificadores Nominales", description: "Tópico para los clasificadores nominales.", lessonTitle: "Clasificadores Nominales en Kamëntsá" },
      { title: "Articulación Detallada", description: "Tópico para la articulación detallada de sonidos.", lessonTitle: "Articulación Detallada de Sonidos" },
      { title: "Combinaciones Sonoras", description: "Tópico para las combinaciones sonoras.", lessonTitle: "Combinaciones Sonoras en Kamëntsá" },
      { title: "Consonantes", description: "Tópico para las consonantes del Kamëntsá.", lessonTitle: "Las Consonantes del Kamëntsá" },
      { title: "Número", description: "Tópico para el número en sustantivos.", lessonTitle: "El Número en Sustantivos Kamëntsá" },
      { title: "Patrones Acentuación", description: "Tópico para los patrones de acentuación.", lessonTitle: "Patrones de Acentuación en Kamëntsá" },
      { title: "Pronunciación", description: "Tópico para la guía de pronunciación.", lessonTitle: "Guía de Pronunciación del Kamëntsá" },
      { title: "Variaciones Dialectales", description: "Tópico para las variaciones dialectales.", lessonTitle: "Variaciones Dialectales del Kamëntsá" },
      { title: "Vocales", description: "Tópico para las vocales del Kamëntsá.", lessonTitle: "Las Vocales del Kamëntsá" },
      // Tópicos adicionales que pueden ser necesarios para ejercicios o contenido cultural
      { title: "Historia", description: "Tópico para la historia del pueblo Kamëntsá.", lessonTitle: "Historia del Pueblo Kamëntsá" },
      { title: "Mitos y Leyendas", description: "Tópico para mitos y leyendas Kamëntsá.", lessonTitle: "Cuentos Tradicionales" },
      { title: "Música", description: "Tópico para la música tradicional Kamëntsá.", lessonTitle: "Música Tradicional Kamëntsá" },
      { title: "Danza", description: "Tópico para las danzas tradicionales Kamëntsá.", lessonTitle: "Cultura y Tradiciones" }, // Asumiendo que esta lección existe
      { title: "Medicina", description: "Tópico para la medicina tradicional Kamëntsá.", lessonTitle: "Medicina Tradicional Kamëntsá" },
      { title: "Artesanía", description: "Tópico para la artesanía Kamëntsá.", lessonTitle: "Artesanía Kamëntsá" },
      { title: "Rituales", description: "Tópico para rituales y ceremonias Kamëntsá.", lessonTitle: "Rituales y Ceremonias Kamëntsá" },
      { title: "Colores", description: "Tópico para los colores en Kamëntsá.", lessonTitle: "Colores en Kamëntsá" },
      { title: "Números", description: "Tópico para los números en Kamëntsá.", lessonTitle: "Números en Kamëntsá" },
      { title: "Animales", description: "Tópico para animales nativos.", lessonTitle: "Animales Nativos" },
      { title: "Plantas", description: "Tópico para plantas nativas.", lessonTitle: "Plantas Nativas" },
      { title: "Cuerpo Humano", description: "Tópico para partes del cuerpo humano.", lessonTitle: "Partes del Cuerpo" },
      { title: "Preguntas y Respuestas", description: "Tópico para preguntas y respuestas comunes.", lessonTitle: "Preguntas Comunes" },
      { title: "Sentimientos", description: "Tópico para la expresión de sentimientos.", lessonTitle: "Expresión de Sentimientos" },
      { title: "Tiempos Verbales", description: "Tópico para los tiempos verbales en Kamëntsá.", lessonTitle: "Tiempos Verbales Básicos" },
      { title: "Saludos", description: "Tópico para saludos y presentaciones.", lessonTitle: "Saludos y Despedidas" },
      { title: "Familia", description: "Tópico para vocabulario relacionado con la familia.", lessonTitle: "La Familia Kamëntsá" },
      { title: "Comida", description: "Tópico para vocabulario relacionado con la comida.", lessonTitle: "Comida Tradicional" },
      { title: "Vida Diaria", description: "Tópico para aspectos de la vida diaria.", lessonTitle: "Aspectos de la Vida Diaria" },
      { title: "Sintaxis Avanzada", description: "Tópico para sintaxis avanzada.", lessonTitle: "Gramática Avanzada" },
      // Tópicos para tipos gramaticales (asumiendo que estas lecciones existen o se crearán)
      { title: "s.", description: "Tópico para sustantivos.", lessonTitle: "Los Sustantivos en Kamëntsá" },
      { title: "v.t.", description: "Tópico para verbos transitivos.", lessonTitle: "Los Verbos en Kamëntsá" },
      { title: "adj.", description: "Tópico para adjetivos.", lessonTitle: "Gramática General" }, // Asumiendo una lección general de gramática
      { title: "num.", description: "Tópico para números.", lessonTitle: "Números en Kamëntsá" },
      { title: "expr.", description: "Tópico para expresiones.", lessonTitle: "Vocabulario General" }, // Asumiendo una lección general de vocabulario
      { title: "interj.", description: "Tópico para interjecciones.", lessonTitle: "Gramática General" },
      { title: "adv.", description: "Tópico para adverbios.", lessonTitle: "Gramática General" },
      { title: "pron.int.", description: "Tópico para pronombres interrogativos.", lessonTitle: "Los Pronombres en Kamëntsá" },
      { title: "adj.pos.", description: "Tópico para adjetivos posesivos.", lessonTitle: "Gramática General" },
      { title: "v.", description: "Tópico para verbos en general.", lessonTitle: "Los Verbos en Kamëntsá" },
      // Nuevos tópicos para las lecciones adicionales
      { title: "Conceptos Fundamentales", description: "Tópico sobre los conceptos básicos del idioma.", lessonTitle: "Conceptos Básicos de Introducción" },
      { title: "Evolución Lingüística", description: "Tópico sobre la evolución histórica del Kamëntsá.", lessonTitle: "Historia del Kamëntsá" },
      { title: "Influencia Cultural", description: "Tópico sobre cómo la cultura influye en el lenguaje.", lessonTitle: "Cultura Kamëntsá y Lenguaje" },
      { title: "Sonidos Glotales", description: "Tópico sobre la articulación de sonidos glotales.", lessonTitle: "Fonemas Complejos" },
      { title: "Estructura de Oraciones", description: "Tópico sobre la construcción de oraciones complejas.", lessonTitle: "Sintaxis Básica" },
      { title: "Verbos de Estado", description: "Tópico sobre verbos que describen estados.", lessonTitle: "Verbos de Movimiento" },
      { title: "Flora y Fauna", description: "Tópico sobre vocabulario de la flora y fauna local.", lessonTitle: "Vocabulario de la Naturaleza" },
      { title: "Aplicaciones de Aprendizaje", description: "Tópico sobre herramientas digitales para el estudio.", lessonTitle: "Recursos Interactivos" },
      { title: "Clasificadores de Tamaño", description: "Tópico sobre clasificadores que indican tamaño.", lessonTitle: "Clasificadores de Forma" },
      { title: "Párrafos Descriptivos", description: "Tópico sobre la escritura de descripciones.", lessonTitle: "Escritura de Textos Cortos" },
      { title: "Ejercicios de Respiración", description: "Tópico sobre técnicas de respiración para la pronunciación.", lessonTitle: "Práctica de Articulación" },
      { title: "Diptongos y Triptongos", description: "Tópico sobre combinaciones de vocales.", lessonTitle: "Combinaciones de Vocales" },
      { title: "Consonantes Oclusivas", description: "Tópico sobre la clasificación de consonantes oclusivas.", lessonTitle: "Consonantes Aspiradas" },
      { title: "Género en Sustantivos", description: "Tópico sobre la expresión de género en sustantivos.", lessonTitle: "Pluralidad en Sustantivos" },
      { title: "Preguntas Abiertas", description: "Tópico sobre la entonación en preguntas abiertas.", lessonTitle: "Entonación en Preguntas" },
      { title: "Pronombres Reflexivos", description: "Tópico sobre el uso de pronombres reflexivos.", lessonTitle: "Pronombres Posesivos" },
      { title: "Variaciones Fonéticas", description: "Tópico sobre las diferencias fonéticas regionales.", lessonTitle: "Acentos Regionales" },
      { title: "Sustantivos Derivados", description: "Tópico sobre la formación de sustantivos a partir de verbos.", lessonTitle: "Sustantivos Abstractos" },
      { title: "Variaciones Gramaticales", description: "Tópico sobre las diferencias gramaticales entre dialectos.", lessonTitle: "Variaciones Léxicas" },
      { title: "Verbos Auxiliares", description: "Tópico sobre el uso de verbos auxiliares.", lessonTitle: "Verbos Transitivos e Intransitivos" },
      { title: "Vocales Nasales", description: "Tópico sobre la pronunciación de vocales nasales.", lessonTitle: "Armonía Vocálica" },
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
          title: topicData.title.toLowerCase(),
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
        title: topicData.title.toLowerCase(),
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
