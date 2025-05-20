import * as fs from "fs";
import * as path from "path";
import { DataSource } from "typeorm"; // Import QueryRunner
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

    // Define los tópicos adicionales que no están en el archivo JSON
    const additionalTopics = [
      { title: "alfabeto", description: "Contenido relacionado con el alfabeto.", unityName: "Bienvenida y Alfabeto" },
      { title: "general", description: "Contenido general.", unityName: "Introducción al Kamëntsá" },
      { title: "gramática básica", description: "Conceptos básicos de gramática.", unityName: "Gramática Fundamental" },
      { title: "recursos adicionales", description: "Recursos adicionales para el aprendizaje.", unityName: "Contenido del Diccionario" },
      { title: "fonética", description: "Sonidos del lenguaje", unityName: "Vocales y Consonantes" },
      { title: "vocabulario general", description: "Vocabulario básico en Kamëntsá.", unityName: "Contenido del Diccionario" },
    ];


    const topicsData = JSON.parse(
      fs.readFileSync(
        path.join(
          __dirname,
          "../files/json/gramatica_fonetica_clasificadores.json"
        ),
        "utf8"
      )
    );
// Mapear las claves del JSON a los títulos de las unidades sembradas
const unityTitleMap: { [key: string]: string } = {
  gramatica: "Gramática Fundamental",
  fonetica: "Fonética y Pronunciación",
  alfabeto: "Bienvenida y Alfabeto",
  general: "Introducción al Kamëntsá",
  "gramática básica": "Gramática Fundamental",
  "recursos adicionales": "Contenido del Diccionario",
  
};


    // Primero, procesa los tópicos adicionales
    for (const topicData of additionalTopics) {
      const unity = await unityRepository.findOne({
        where: { title: topicData.unityName },
      });

      if (!unity) {
        console.warn(
          `No se encontró la unidad con título "${topicData.unityName}". Saltando topic "${topicData.title}".`
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
          `Topic "${topicData.title}" for Unity "${topicData.unityName}" already exists. Skipping.`
        );
        continue;
      }

      const topic = topicRepository.create({
        id: this.dataSource.driver.options.type === 'postgres'
          ? await this.dataSource.query('SELECT uuid_generate_v4()')
            .then((result: any) => result[0].uuid_generate_v4)
          : undefined,
        title: topicData.title.toLowerCase(),
        description: topicData.description,
        unity: unity,
      });

      try {
        await topicRepository.save(topic);
        console.log(
          `Created topic: ${topic.title} for Unity: ${unity.title}`
        );
      } catch (error) {
        console.error(
          `Error al guardar el topic "${topicData.title}" para la unidad "${unity.title}":`,
          error.message
        );
      }
    }

    // Luego, procesa los tópicos del archivo JSON
    const jsonData = JSON.parse(
      fs.readFileSync(
        path.join(
          __dirname,
          "../files/json/gramatica_fonetica_clasificadores.json"
        ),
        "utf8"
      )
    );

    for (const unityTitle in jsonData) {
      const unityTitleMapped = unityTitleMap[unityTitle];

      if (!unityTitleMapped) {
        console.warn(
          `No se encontró un mapeo para la clave JSON "${unityTitle}" a un título de unidad. Saltando.`
        );
        continue;
      }

      const unity = await unityRepository.findOne({
        where: { title: unityTitleMapped },
      });

      if (!unity) {
        console.warn(
          `No se encontró la unidad con título "${unityTitleMapped}". Saltando topics para esta unidad.`
        );
        continue;
      }

      const unityTopics = topicsData[unityTitle];

      for (const topicTitle in unityTopics) {
        const topicData = unityTopics[topicTitle];
        let description = "";

        // Attempt to find a description within the topic data
        if (typeof topicData === "object" && topicData !== null) {
          if ("descripcion" in topicData) {
            description = topicData.descripcion;
          } else {
            // If no explicit description, try to build one from nested descriptions
            const nestedDescriptions: string[] = [];
            const findDescriptions = (obj: any) => {
              for (const key in obj) {
                if (typeof obj[key] === "object" && obj[key] !== null) {
                  if ("descripcion" in obj[key]) {
                    nestedDescriptions.push(obj[key].descripcion);
                  }
                  findDescriptions(obj[key]); // Recurse into nested objects
                }
              }
            };
            findDescriptions(topicData);
            description = nestedDescriptions.join(" ");
          }
        } else if (typeof topicData === "string") {
          description = topicData;
        }

        // Verificar si ya existe un topic con el mismo título para la misma unidad
        const existingTopic = await topicRepository.findOne({
          where: {
            title: topicTitle.toLowerCase(),
            unity: { id: unity.id },
          },
        });

        if (existingTopic) {
          console.log(
            `Topic "${topicTitle}" for Unity "${unityTitle}" already exists. Skipping.`
          );
          continue;
        }

        const topic = topicRepository.create({
          id: this.dataSource.driver.options.type === 'postgres'
            ? await this.dataSource.query('SELECT uuid_generate_v4()')
              .then((result: any) => result[0].uuid_generate_v4)
            : undefined,
          title: topicTitle.toLowerCase(),
          description:
            description || `Descripción por defecto para ${topicTitle}`, // Provide a default if no description found
          unity: unity,
        });

        try {
          await topicRepository.save(topic);
          console.log(
            `Created topic: ${topic.title} for Unity: ${unity.title}`
          );
        } catch (error) {
          console.error(
            `Error al guardar el topic "${topicTitle}" para la unidad "${unityTitle}":`,
            error.message
          );
        }
      }
    }
  }
}

