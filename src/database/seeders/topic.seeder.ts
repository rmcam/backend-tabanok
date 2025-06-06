import { DataSource } from "typeorm";
import { Topic } from "../../features/topic/entities/topic.entity";
import { Unity } from "../../features/unity/entities/unity.entity";
import { DataSourceAwareSeed } from "./data-source-aware-seed";

interface TopicSeedData {
  title: string;
  description: string;
  unityName: string;
}

export class TopicSeeder extends DataSourceAwareSeed {
  constructor(dataSource: DataSource) {
    super(dataSource);
  }

  async run(): Promise<void> {
    const topicRepository = this.dataSource.getRepository(Topic);
    const unityRepository = this.dataSource.getRepository(Unity);

    // Define los tópicos que el ContentSeeder espera
    const topicsToSeed: TopicSeedData[] = [
      { title: "General", description: "Contenido general e introductorio del idioma Kamëntsá.", unityName: "Introducción al Kamëntsá" },
      { title: "Fonética y Pronunciación", description: "Estudio de los sonidos, alfabeto, articulación y variaciones dialectales del Kamëntsá.", unityName: "Vocales y Consonantes" },
      { title: "Gramática Básica", description: "Conceptos fundamentales de la gramática Kamëntsá, incluyendo sustantivos, verbos y pronombres.", unityName: "Gramática Fundamental" },
      { title: "Vocabulario General", description: "Entradas del diccionario Kamëntsá-Español y Español-Kamëntsá sin una categoría específica.", unityName: "Vocabulario General" },
      { title: "Recursos Adicionales", description: "Material complementario y referencias para el aprendizaje del Kamëntsá.", unityName: "Contenido del Diccionario" },
      { title: "Alfabeto", description: "Detalles sobre el alfabeto Kamëntsá y sus letras.", unityName: "Vocales y Consonantes" },
      { title: "Sustantivos", description: "Información sobre sustantivos y clasificadores nominales en Kamëntsá.", unityName: "Gramática Fundamental" },
      { title: "Pronombres", description: "Detalles sobre los pronombres personales en Kamëntsá.", unityName: "Gramática Fundamental" },
      { title: "Verbos", description: "Conjugación y uso de verbos en Kamëntsá.", unityName: "Gramática Fundamental" },
      { title: "Clasificadores Nominales", description: "Tópico para los clasificadores nominales.", unityName: "Clasificadores Nominales Detallados" },
      { title: "Articulación Detallada", description: "Tópico para la articulación detallada de sonidos.", unityName: "Articulación de Sonidos Específicos" },
      { title: "Combinaciones Sonoras", description: "Tópico para las combinaciones sonoras.", unityName: "Grupos Consonánticos y Reglas de Unión" },
      { title: "Consonantes", description: "Tópico para las consonantes del Kamëntsá.", unityName: "Sistema Consonántico Kamëntsá" },
      { title: "Número", description: "Tópico para el número en sustantivos.", unityName: "Número en Sustantivos Kamëntsá" },
      { title: "Patrones Acentuación", description: "Tópico para los patrones de acentuación.", unityName: "Acentuación y Ritmo del Idioma" },
      { title: "Pronunciación", description: "Tópico para la guía de pronunciación.", unityName: "Guía Completa de Pronunciación" },
      { title: "Variaciones Dialectales", description: "Tópico para las variaciones dialectales.", unityName: "Variaciones Regionales del Kamëntsá" },
      { title: "Vocales", description: "Tópico para las vocales del Kamëntsá.", unityName: "Sistema Vocálico Kamëntsá" },
      // Tópicos adicionales que pueden ser necesarios para ejercicios o contenido cultural
      { title: "Historia", description: "Tópico para la historia del pueblo Kamëntsá.", unityName: "Historia del Pueblo Kamëntsá" },
      { title: "Mitos y Leyendas", description: "Tópico para mitos y leyendas Kamëntsá.", unityName: "Textos Sencillos" },
      { title: "Música", description: "Tópico para la música tradicional Kamëntsá.", unityName: "La Música Kamëntsá" },
      { title: "Danza", description: "Tópico para las danzas tradicionales Kamëntsá.", unityName: "Cultura y Tradiciones" },
      { title: "Medicina", description: "Tópico para la medicina tradicional Kamëntsá.", unityName: "Comida y Naturaleza" },
      { title: "Artesanía", description: "Tópico para la artesanía Kamëntsá.", unityName: "Artesanía y Vestimenta" },
      { title: "Rituales", description: "Tópico para rituales y ceremonias Kamëntsá.", unityName: "Rituales y Ceremonias" },
      { title: "Colores", description: "Tópico para los colores en Kamëntsá.", unityName: "Colores y Formas" },
      { title: "Números", description: "Tópico para los números en Kamëntsá.", unityName: "Números y Cantidades" },
      { title: "Animales", description: "Tópico para animales nativos.", unityName: "Animales y Plantas Nativas" },
      { title: "Plantas", description: "Tópico para plantas nativas.", unityName: "Animales y Plantas Nativas" },
      { title: "Cuerpo Humano", description: "Tópico para partes del cuerpo humano.", unityName: "El Cuerpo Humano" },
      { title: "Preguntas y Respuestas", description: "Tópico para preguntas y respuestas comunes.", unityName: "Preguntas y Respuestas" },
      { title: "Sentimientos", description: "Tópico para la expresión de sentimientos.", unityName: "Expresión de Sentimientos" },
      { title: "Tiempos Verbales", description: "Tópico para los tiempos verbales en Kamëntsá.", unityName: "Tiempos Verbales Básicos" },
      { title: "Saludos", description: "Tópico para saludos y presentaciones.", unityName: "Saludos y Presentaciones" },
      { title: "Familia", description: "Tópico para vocabulario relacionado con la familia.", unityName: "Familia y Comunidad" },
      { title: "Comida", description: "Tópico para vocabulario relacionado con la comida.", unityName: "Comida y Naturaleza" },
      { title: "Vida Diaria", description: "Tópico para aspectos de la vida diaria.", unityName: "Aspectos de la Vida Diaria" },
      { title: "Sintaxis Avanzada", description: "Tópico para sintaxis avanzada.", unityName: "Sintaxis Avanzada" },
      // Tópicos para tipos gramaticales
      { title: "s.", description: "Tópico para sustantivos.", unityName: "Vocabulario General" },
      { title: "v.t.", description: "Tópico para verbos transitivos.", unityName: "Gramática Fundamental" },
      { title: "adj.", description: "Tópico para adjetivos.", unityName: "Vocabulario General" },
      { title: "num.", description: "Tópico para números.", unityName: "Vocabulario General" },
      { title: "expr.", description: "Tópico para expresiones.", unityName: "Vocabulario General" },
      { title: "interj.", description: "Tópico para interjecciones.", unityName: "Vocabulario General" },
      { title: "adv.", description: "Tópico para adverbios.", unityName: "Gramática Fundamental" },
      { title: "pron.int.", description: "Tópico para pronombres interrogativos.", unityName: "Gramática Fundamental" },
      { title: "adj.pos.", description: "Tópico para adjetivos posesivos.", unityName: "Gramática Fundamental" },
      { title: "v.", description: "Tópico para verbos en general.", unityName: "Gramática Fundamental" },
    ];

    for (const topicData of topicsToSeed) {
      const unity = await unityRepository.findOne({
        where: { title: topicData.unityName },
      });

      if (!unity) {
        console.warn(
          `[TopicSeeder] No se encontró la unidad con título "${topicData.unityName}". Saltando topic "${topicData.title}".`
        );
        continue;
      }

      const existingTopic = await topicRepository.findOne({
        where: {
          title: topicData.title.toLowerCase(),
          unity: { id: unity.id },
        },
      });

      if (existingTopic) {
        console.log(
          `[TopicSeeder] Topic "${topicData.title}" for Unity "${topicData.unityName}" already exists. Skipping.`
        );
        continue;
      }

      const topic = topicRepository.create({
        title: topicData.title.toLowerCase(),
        description: topicData.description,
        unity: unity,
      });

      try {
        await topicRepository.save(topic);
        console.log(
          `[TopicSeeder] Created topic: ${topic.title} for Unity: ${unity.title}`
        );
      } catch (error) {
        console.error(
          `[TopicSeeder] Error al guardar el topic "${topicData.title}" para la unidad "${unity.title}":`,
          error.message
        );
      }
    }
  }
}
