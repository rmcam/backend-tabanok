import * as fs from 'fs';
import * as path from 'path';
import { DataSourceAwareSeed } from './index';
import { DataSource } from 'typeorm';
import { Topic } from '../../features/topic/entities/topic.entity';
import { Unity } from '../../features/unity/entities/unity.entity';

export class TopicSeeder extends DataSourceAwareSeed {
  constructor(dataSource: DataSource) {
    super(dataSource);
  }

  async run(): Promise<void> {
    const topicRepository = this.dataSource.getRepository(Topic);
    const unityRepository = this.dataSource.getRepository(Unity);

    const unities = await unityRepository.find();

    if (unities.length === 0) {
      console.log('No unities found. Skipping TopicSeeder.');
      return;
    }

    const dictionaryPath = path.resolve(
      __dirname,
      '../files/json/consolidated_dictionary.json',
    );
    const dictionaryContent = JSON.parse(
      fs.readFileSync(dictionaryPath, 'utf-8'),
    );

    const vocabularyEntries =
      dictionaryContent.sections.diccionario.content.kamensta_espanol;

    // Extraer tipos únicos y agregar 'General'
    const uniqueTypes = new Set(vocabularyEntries.map((entry: any) => entry.tipo as string | undefined));
    const topicsToSeedData = Array.from(uniqueTypes)
      .filter((type): type is string => type !== undefined)
      .map(type => {
        let unityName = 'Contenido del Diccionario'; // Default unity for dictionary types

        // Mejorar la asociación de temas a unidades basadas en el tipo de vocabulario
        if (type.includes('verbo')) {
            unityName = 'Tiempos Verbales Básicos';
        } else if (type.includes('saludo')) {
            unityName = 'Saludos y Presentaciones';
        } else if (type.includes('familia')) {
            unityName = 'Familia y Comunidad';
        } else if (type.includes('comida')) {
            unityName = 'Comida y Naturaleza';
        } else if (type.includes('color')) {
            unityName = 'Colores y Formas';
        } else if (type.includes('numero')) {
            unityName = 'Números y Cantidades';
        } else if (type.includes('animal')) {
            unityName = 'Animales y Plantas Nativas';
        } else if (type.includes('cuerpo')) {
            unityName = 'El Cuerpo Humano';
        } else if (type.includes('pregunta')) {
            unityName = 'Preguntas y Respuestas';
        } else if (type.includes('sentimiento')) {
            unityName = 'Expresión de Sentimientos';
        } else if (type.includes('musica')) {
            unityName = 'La Música Kamëntsá';
        } else if (type.includes('artesania')) {
            unityName = 'Artesanía y Vestimenta';
        } else if (type.includes('historia')) {
            unityName = 'Historia del Pueblo Kamëntsá';
        } else if (type.includes('lugar')) {
            unityName = 'Direcciones y Lugares';
        }


        return {
          title: type as string,
          description: `Vocabulario de tipo "${type}"`,
          unityName: unityName,
        };
      });

    // Agregar tema 'General' si no existe ya y asociarlo a una unidad relevante
    if (!uniqueTypes.has('General')) {
        topicsToSeedData.push({
            title: 'General',
            description: 'Vocabulario general y variado.',
            unityName: 'Vocabulario General', // Asociar a la unidad de vocabulario general
        });
    }

    // Add specific topics required by ContentSeeder and other relevant topics
    topicsToSeedData.push(
        { title: 'Alfabeto Kamëntsá', description: 'Temas relacionados con el alfabeto y su uso.', unityName: 'Bienvenida y Alfabeto' },
        { title: 'Fonética y Pronunciación', description: 'Temas relacionados con los sonidos y la pronunciación correcta.', unityName: 'Vocales y Consonantes' },
        { title: 'Gramática Básica', description: 'Temas relacionados con la estructura básica de las oraciones.', unityName: 'Estructura de la Oración' },
        { title: 'Comprensión Lectora', description: 'Temas relacionados con la lectura y entendimiento de textos.', unityName: 'Textos Sencillos' },
        { title: 'Uso del Diccionario', description: 'Temas relacionados con cómo utilizar el diccionario Kamëntsá-Español.', unityName: 'Contenido del Diccionario' },
        { title: 'Números Cardinales', description: 'Temas relacionados con los números para contar.', unityName: 'Números y Cantidades' },
        { title: 'Colores Primarios', description: 'Temas relacionados con los colores básicos.', unityName: 'Colores y Formas' },
        { title: 'Verbos de Acción', description: 'Temas relacionados con verbos que indican acciones.', unityName: 'Tiempos Verbales Básicos' },
        { title: 'Sustantivos Comunes', description: 'Temas relacionados con nombres de personas, lugares o cosas.', unityName: 'Vocabulario General' },
        { title: 'Adjetivos Descriptivos', description: 'Temas relacionados con palabras que describen sustantivos.', unityName: 'Vocabulario General' },
        { title: 'Adverbios de Tiempo', description: 'Temas relacionados con palabras que indican cuándo ocurre algo.', unityName: 'Aspectos de la Vida Diaria' },
        { title: 'Preposiciones', description: 'Temas relacionados con palabras que indican relación entre elementos.', unityName: 'Estructura de la Oración' },
        { title: 'Conjunciones', description: 'Temas relacionados con palabras que unen oraciones o frases.', unityName: 'Estructura de la Oración' },
        { title: 'Interrogativos', description: 'Temas relacionados con palabras para hacer preguntas.', unityName: 'Preguntas y Respuestas' },
        { title: 'Exclamativos', description: 'Temas relacionados con palabras para expresar sorpresa o emoción.', unityName: 'Expresión de Sentimientos' },
        { title: 'Tradiciones Orales', description: 'Temas relacionados con la transmisión oral de conocimientos y relatos.', unityName: 'Cultura y Tradiciones' },
        { title: 'Historia Reciente', description: 'Temas relacionados con eventos y cambios recientes en la comunidad.', unityName: 'Historia del Pueblo Kamëntsá' },
    );


    for (const topicData of topicsToSeedData) {
      const existingTopic = await topicRepository.findOne({
        where: { title: topicData.title },
      });

      if (!existingTopic) {
          // Find the correct unity by name
          const unity = unities.find((u) => u.title === topicData.unityName);

          if (unity) {
              const newTopic = topicRepository.create({
                title: topicData.title,
                description: topicData.description,
                unity: unity,
                unityId: unity.id,
              });

              await topicRepository.save(newTopic);
              console.log(`Topic "${topicData.title}" seeded.`);
          } else {
              console.log(`Unity "${topicData.unityName}" not found for Topic "${topicData.title}". Skipping.`);
          }
      } else {
        console.log(`Topic "${topicData.title}" already exists. Skipping.`);
      }
    }
  }
}
