import * as fs from "fs";
import * as path from "path";
import { DataSource, QueryRunner } from "typeorm"; // Import QueryRunner
import { Content } from "../../features/content/entities/content.entity";
import { Topic } from "../../features/topic/entities/topic.entity";
import { Unity } from "../../features/unity/entities/unity.entity";
import { DataSourceAwareSeed } from "./data-source-aware-seed";

// Import the consolidated dictionary JSON
import * as consolidatedDictionary from "../files/json/consolidated_dictionary.json";

export class ContentSeeder extends DataSourceAwareSeed {
  constructor(dataSource: DataSource) {
    super(dataSource);
  }

  async run(): Promise<void> {
    console.log("[ContentSeeder] Starting to run seeder.");
    const queryRunner = this.dataSource.createQueryRunner(); // Use QueryRunner for transaction
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const contentRepository = queryRunner.manager.getRepository(Content); // Use queryRunner.manager
      const unityRepository = queryRunner.manager.getRepository(Unity); // Use queryRunner.manager
      const topicRepository = queryRunner.manager.getRepository(Topic); // Use queryRunner.manager

      // Optional: Clear existing content for a clean seed (use with caution in production)
      // console.log("[ContentSeeder] Clearing existing content...");
      // await contentRepository.clear();
      // console.log("[ContentSeeder] Existing content cleared.");

      const unities = await unityRepository.find();
      console.log(`[ContentSeeder] Found ${unities.length} unities.`);

      const topics = await topicRepository.find();
      console.log(`[ContentSeeder] Found ${topics.length} topics.`);

      if (unities.length === 0) {
        console.log("[ContentSeeder] No unities found. Skipping ContentSeeder.");
        await queryRunner.rollbackTransaction();
        await queryRunner.release();
        return;
      }

      if (topics.length === 0) {
        console.log("[ContentSeeder] No topics found. Skipping ContentSeeder.");
        await queryRunner.rollbackTransaction();
        await queryRunner.release();
        return;
      }

      // Create maps for quick lookup by title
      const unityMap = new Map<string, Unity>();
      unities.forEach(unity => unityMap.set(unity.title, unity));

      const topicMap = new Map<string, Topic>();
      topics.forEach(topic => topicMap.set(topic.title, topic));


      // Read estructura.json to get the paths to the other JSON files
      const estructuraPath = path.resolve(__dirname, "../files/json/estructura.json");
      console.log(
        `[ContentSeeder] Reading estructura.json from: ${estructuraPath}`
      );

      let estructuraContent: any;
      try {
        estructuraContent = JSON.parse(
          fs.readFileSync(estructuraPath, "utf-8")
        );
        console.log(`[ContentSeeder] Successfully read estructura.json`);
      } catch (error) {
        console.error(`[ContentSeeder] Error reading estructura.json: ${error.message}`);
        // Continue processing, as consolidated_dictionary.json is an alternative source
      }


      const contentItemsToSave: Content[] = [];
      const processedSections = new Set<string>(); // Track sections processed from dedicated files

      // Process sections defined in estructura.json first
      if (estructuraContent && estructuraContent.estructura && estructuraContent.estructura.secciones) {
        for (const sectionName in estructuraContent.estructura.secciones) {
          const sectionRelativePath =
            estructuraContent.estructura.secciones[sectionName];
          const sectionPath = path.resolve(__dirname, "../", sectionRelativePath); // Adjust path resolution

          // Check if the file exists before processing
          if (!fs.existsSync(sectionPath)) {
            console.log(
              `[ContentSeeder] Dedicated file not found: ${sectionPath}. Will attempt to use consolidated_dictionary.json for section ${sectionName}.`
            );
            continue; // Skip to the next section, will be handled by consolidated dictionary logic
          }
          console.log(`[ContentSeeder] Processing dedicated file for section: ${sectionName}, path: ${sectionPath}`);

          let contentItems: any[] = [];
          let source = "dedicated file";

          try {
            const sectionContent = JSON.parse(
              fs.readFileSync(sectionPath, "utf-8")
            );

            // --- Logic to extract and map data from dedicated files ---
            if (Array.isArray(sectionContent)) {
              // If the content is directly an array of items
              contentItems = sectionContent;
            } else if (typeof sectionContent === "object" && sectionContent !== null) {
              // If not an array, check for known properties that contain arrays
              if (sectionName === "alfabeto" && Array.isArray(sectionContent.letras)) {
                contentItems = sectionContent.letras.map((letra: string, index: number) => ({
                  title: `Letra ${letra.toUpperCase()}`,
                  description: `Información sobre la letra ${letra}`,
                  type: "alfabeto",
                  content: { letra: letra, descripcion: sectionContent.descripcion },
                  unityTitle: "Bienvenida y Alfabeto",
                  topicTitle: "Alfabeto", // Assuming a 'Alfabeto' topic exists
                  order: index,
                }));
              } else if (sectionName === "articulacion_detallada" && Array.isArray(sectionContent.sonidos_especificos)) {
                contentItems = sectionContent.sonidos_especificos.map((sonido: any, index: number) => ({
                  title: `Sonido ${sonido.sonido}`,
                  description: sonido.descripcion_articulatoria,
                  type: "fonetica",
                  content: sonido,
                  unityTitle: "Vocales y Consonantes",
                  topicTitle: "Fonética", // Assuming a 'Fonética' topic exists
                  order: index,
                }));
              } else if (sectionName === "saludos_despedidas" && Array.isArray(sectionContent.entradas)) {
                contentItems = sectionContent.entradas.map((entrada: any, index: number) => ({
                  title: entrada.camensta,
                  description: entrada.espanol,
                  type: "expresion",
                  content: entrada,
                  unityTitle: "Saludos y Presentaciones",
                  topicTitle: "Saludos y Despedidas", // Assuming a 'Saludos y Despedidas' topic exists
                  order: index,
                }));
              } else if (sectionName === "expresiones_comunes" && Array.isArray(sectionContent.entradas)) {
                contentItems = sectionContent.entradas.map((entrada: any, index: number) => ({
                  title: entrada.camensta,
                  description: entrada.espanol,
                  type: "expresion",
                  content: entrada,
                  unityTitle: "Conversación Cotidiana", // Using the corrected Unity title
                  topicTitle: "Expresiones Comunes", // Assuming an 'Expresiones Comunes' topic exists
                  order: index,
                }));
              }
              // Add more conditions here for other known object structures in dedicated files
            }
            // --- End of logic for dedicated files ---

          } catch (error: any) {
            console.error(
              `[ContentSeeder] Error reading or processing dedicated file ${sectionPath} for section ${sectionName}: ${error.message}`
            );
            continue; // Skip this dedicated file
          }

          if (contentItems.length > 0) {
            console.log(`[ContentSeeder] Found ${contentItems.length} items in dedicated file for section: ${sectionName}.`);
            for (const contentData of contentItems) {
              const unity = unityMap.get(contentData.unityTitle);
              const topic = topicMap.get(contentData.topicTitle?.toLowerCase()?.trim() || '');

              if (unity && topic) {
                const newContent = contentRepository.create({
                  // id: contentData.id, // Let the database generate ID
                  title: contentData.title,
                  description: contentData.description,
                  type: contentData.type,
                  content: contentData.content,
                  unity: unity,
                  unityId: unity.id,
                  topic: topic,
                  topicId: topic.id,
                  order: contentData.order,
                });
                contentItemsToSave.push(newContent);
              } else {
                console.warn(
                  `[ContentSeeder] Unity "${contentData.unityTitle}" or Topic "${contentData.topicTitle}" not found for Content "${contentData.title}" from dedicated file for section ${sectionName}. Skipping.`
                );
              }
            }
            processedSections.add(sectionName); // Mark this section as processed from a dedicated file
          } else {
            console.log(
              `[ContentSeeder] No content items found or processed in dedicated file for section: ${sectionName}.`
            );
          }
        }
      } else {
        console.warn("[ContentSeeder] estructura.json not found or has unexpected structure. Relying solely on consolidated_dictionary.json.");
      }


      // Process data from consolidated_dictionary.json for sections not processed from dedicated files
      console.log("[ContentSeeder] Processing data from consolidated_dictionary.json...");

      const consolidatedSections = consolidatedDictionary.sections;
      const clasificadoresNominales =
        consolidatedDictionary.clasificadores_nominales.content;

      // Define a mapping from consolidated section names to default Unity and Topic titles
      const consolidatedSectionMapping: { [key: string]: { unity: string, topic: string, type?: string } } = {
        "introduccion": { unity: "Introducción al Kamëntsá", topic: "General", type: "texto" },
        "generalidades": { unity: "Introducción al Kamëntsá", topic: "General", type: "texto" },
        "fonetica": { unity: "Fonética y Pronunciación", topic: "Fonética y Pronunciación", type: "fonetica" },
        "gramatica": { unity: "Gramática Fundamental", topic: "Gramática Básica", type: "gramatica" },
        "diccionario": { unity: "Vocabulario General", topic: "Diccionario", type: "diccionario" }, // Default for dictionary entries
        "recursos": { unity: "Contenido del Diccionario", topic: "General", type: "recursos" }, // Or a more specific unity/topic
        // "clasificadores_nominales" will be handled separately or mapped to a specific topic
      };


      for (const sectionName in consolidatedSections) {
        // Skip sections already processed from dedicated files
        if (processedSections.has(sectionName)) {
          console.log(`[ContentSeeder] Section "${sectionName}" already processed from dedicated file. Skipping consolidated dictionary.`);
          continue;
        }

        const sectionData = consolidatedSections[sectionName];
        const mapping = consolidatedSectionMapping[sectionName];

        if (!mapping) {
          console.log(`[ContentSeeder] No mapping defined for consolidated section "${sectionName}". Skipping.`);
          continue;
        }

        let relevantData: any[] = [];
        let defaultContentType = mapping.type || "informacion";
        let defaultUnityTitle = mapping.unity;
        let defaultTopicTitle = mapping.topic;

        // --- Logic to extract and map data from consolidated_dictionary.json ---
        if (sectionName === "diccionario") {
          relevantData = [
            ...(sectionData.content.kamensta_espanol || []),
            ...(sectionData.content.espanol_kamensta || []),
          ];
          // For dictionary entries, the topic will be determined by the entry's 'tipo' field
        } else if (sectionName === "fonetica") {
           // Extract relevant parts from the fonetica section
            const foneticaContent = sectionData.content;
            relevantData = [
              ...(foneticaContent.vocales
                ? [
                    {
                      title: "Vocales",
                      content: foneticaContent.vocales,
                      type: "fonetica-vocales",
                    },
                  ]
                : []),
              ...(foneticaContent.consonantes
                ? [
                    {
                      title: "Consonantes",
                      content: foneticaContent.consonantes,
                      type: "fonetica-consonantes",
                    },
                  ]
                : []),
              ...(foneticaContent.combinaciones_sonoras
                ? [
                    {
                      title: "Combinaciones Sonoras",
                      content: foneticaContent.combinaciones_sonoras,
                      type: "fonetica-combinaciones",
                    },
                  ]
                : []),
              ...(foneticaContent.alfabeto
                ? [
                    {
                      title: "Alfabeto",
                      content: foneticaContent.alfabeto,
                      type: "fonetica-alfabeto",
                    },
                  ]
                : []),
              ...(foneticaContent.pronunciacion
                ? [
                    {
                      title: "Reglas de Pronunciación",
                      content: foneticaContent.pronunciacion,
                      type: "fonetica-pronunciacion",
                    },
                  ]
                : []),
              ...(foneticaContent.patrones_acentuacion
                ? [
                    {
                      title: "Patrones de Acentuación",
                      content: foneticaContent.patrones_acentuacion,
                      type: "fonetica-acentuacion",
                    },
                  ]
                : []),
              ...(foneticaContent.variaciones_dialectales
                ? [
                    {
                      title: "Variaciones Dialectales",
                      content: foneticaContent.variaciones_dialectales,
                      type: "fonetica-variaciones",
                    },
                  ]
                : []),
              ...(foneticaContent.articulacion_detallada
                ? [
                    {
                      title: "Articulación Detallada",
                      content: foneticaContent.articulacion_detallada,
                      type: "fonetica-articulacion",
                    },
                  ]
                : []),
            ];
             defaultTopicTitle = "Fonética y Pronunciación"; // Specific topic for fonetica
        } else if (sectionName === "gramatica") {
            // Extract relevant parts from the gramatica section
            const gramaticaContent = sectionData.content;
            relevantData = [
              ...(gramaticaContent.sustantivos
                ? [
                    {
                      title: "Sustantivos",
                      content: gramaticaContent.sustantivos,
                      type: "gramatica-sustantivos",
                    },
                  ]
                : []),
              ...(gramaticaContent.verbos
                ? [
                    {
                      title: "Verbos",
                      content: gramaticaContent.verbos,
                      type: "gramatica-verbos",
                    },
                  ]
                : []),
              ...(gramaticaContent.pronombres
                ? [
                    {
                      title: "Pronombres",
                      content: gramaticaContent.pronombres,
                      type: "gramatica-pronombres",
                    },
                  ]
                : []),
              // Add other grammar sections as needed
            ];
             defaultTopicTitle = "Gramática Básica"; // Specific topic for gramatica
        } else if (sectionName === "recursos") {
            // Extract relevant parts from the recursos section
            const recursosContent = sectionData.content;
            relevantData = [
              ...(recursosContent.ejemplos
                ? recursosContent.ejemplos.map((ej: any) => ({
                    title: ej.titulo,
                    content: ej.contenido,
                    type: "recursos-ejemplo",
                  }))
                : []),
              ...(recursosContent.referencias
                ? recursosContent.referencias.map((ref: any) => ({
                    title: ref.titulo,
                    content: ref.contenido,
                    type: "recursos-referencia",
                  }))
                : []),
              ...(recursosContent.anexos
                ? recursosContent.anexos.map((an: any) => ({
                    title: an.titulo,
                    content: an.contenido,
                    type: "recursos-anexo",
                  }))
                : []),
            ];
             defaultTopicTitle = "General"; // Or a more specific topic
        } else if (sectionName === "clasificadores_nominales") {
             relevantData = clasificadoresNominales || [];
             defaultContentType = "clasificador";
             defaultUnityTitle = "Gramática Fundamental"; // Or a more specific unity
             defaultTopicTitle = "Sustantivos"; // Or a more specific topic related to nouns
        } else if (Array.isArray(sectionData.content)) {
          // For sections where content is a direct array (like introduccion, generalidades)
          relevantData = sectionData.content;
        } else if (typeof sectionData.content === 'object' && sectionData.content !== null) {
           // Handle cases where content is an object with nested data, e.g., generalidades with subtitulos
           // This part might need more specific logic based on the structure of each section
           if (sectionName === 'generalidades' && sectionData.content.subtitulos) {
               relevantData = Object.entries(sectionData.content.subtitulos).map(([subTitle, subContent]) => ({
                   title: subTitle,
                   description: typeof subContent === 'string' ? subContent : JSON.stringify(subContent),
                   content: subContent,
                   type: `${defaultContentType}-${subTitle.toLowerCase().replace(/\s+/g, '-')}`
               }));
           } else {
               // Default handling for object content - might need refinement
               relevantData = [{
                   title: sectionData.metadata?.title || sectionName,
                   description: sectionData.metadata?.description || `Content for ${sectionName}`,
                   content: sectionData.content,
                   type: defaultContentType
               }];
           }
        }
        // --- End of logic for consolidated_dictionary.json ---


        if (relevantData.length > 0) {
          console.log(
            `[ContentSeeder] Found ${relevantData.length} items in consolidated_dictionary.json for section: ${sectionName}.`
          );
          for (const item of relevantData) {
            let contentTitle = item.title || item.entrada || `Item ${contentItemsToSave.length + 1}`;
            let contentDescription =
              item.description ||
              (item.significados
                ? item.significados.map((sig: any) => sig.definicion).join(", ")
                : "") ||
              (item.equivalentes
                ? item.equivalentes.map((eq: any) => eq.palabra).join(", ")
                : "") ||
              JSON.stringify(item.content) ||
              "No description available";
            let contentType = item.type || defaultContentType;
            let contentContent = item.content || item; // Store the relevant part or the whole item

            // Determine Unity and Topic based on item data and default mapping
            let unityTitle = item.unityTitle || defaultUnityTitle;
            let topicTitle = item.topicTitle || defaultTopicTitle;

            // For dictionary entries, use the 'tipo' field for the topic title if available
            if (sectionName === "diccionario" && item.tipo) {
                 topicTitle = item.tipo;
                 unityTitle = "Vocabulario General"; // Dictionary entries go to Vocabulario General
            } else if (sectionName === "clasificadores_nominales") {
                 topicTitle = "Sustantivos"; // Classifiers go to Sustantivos topic
                 unityTitle = "Gramática Fundamental"; // Classifiers go to Gramática Fundamental unity
                 contentTitle = `Clasificador: ${item.sufijo}`;
                 contentDescription = item.significado;
                 contentContent = item; // Store the whole item
                 contentType = "clasificador";
            } else if (sectionName === "recursos" && item.titulo) {
                 contentTitle = item.titulo;
                 contentDescription = typeof item.contenido === 'string' ? item.contenido : JSON.stringify(item.contenido);
                 contentContent = item.contenido;
                 contentType = item.type || "recurso";
                 unityTitle = "Contenido del Diccionario"; // Resources go to Contenido del Diccionario
                 topicTitle = "Recursos Adicionales"; // Assuming a 'Recursos Adicionales' topic exists
            }


            const unity = unityMap.get(unityTitle);
            const topic = topicMap.get(topicTitle);

            if (unity && topic) {
               // Check if content with the same title already exists to avoid duplicates
               const existingContent = contentItemsToSave.find(c => c.title === contentTitle);
               if (!existingContent) {
                    const newContent = contentRepository.create({
                      // id: item.id, // Let the database generate ID
                      title: contentTitle,
                      description: contentDescription,
                      type: contentType,
                      content: contentContent,
                      unity: unity,
                      unityId: unity.id,
                      topic: topic,
                      topicId: topic.id,
                      order: item.order || 0, // Use order from data if available, otherwise default to 0
                    });
                    contentItemsToSave.push(newContent);
               } else {
                   console.log(`[ContentSeeder] Content with title "${contentTitle}" already prepared for saving. Skipping duplicate from consolidated dictionary.`);
               }
            } else {
              console.warn(
                `[ContentSeeder] Unity "${unityTitle}" or Topic "${topicTitle}" not found for Content "${contentTitle}" from consolidated_dictionary.json for section ${sectionName}. Skipping.`
              );
              if (!unity) console.warn(`[ContentSeeder] Unity "${unityTitle}" not found.`);
              if (!topic) console.warn(`[ContentSeeder] Topic "${topicTitle}" not found.`);
            }
          }
        } else {
          console.log(
            `[ContentSeeder] No relevant content items found in consolidated_dictionary.json for section: ${sectionName}.`
          );
        }
      }


      if (contentItemsToSave.length > 0) {
        console.log(`[ContentSeeder] Saving ${contentItemsToSave.length} content items...`);
        // Use upsert for idempotency
        await contentRepository.upsert(
          contentItemsToSave,
          {
            conflictPaths: ["title", "unityId", "topicId"], // Define conflict strategy
            skipUpdateIfNoValuesChanged: true,
          }
        );
        console.log("[ContentSeeder] Content seeded successfully.");
      } else {
        console.log("[ContentSeeder] No new content items to save.");
      }


      await queryRunner.commitTransaction();
      console.log("[ContentSeeder] Seeding transaction committed successfully.");

    } catch (error) {
      await queryRunner.rollbackTransaction();
      console.error('[ContentSeeder] Error seeding content:', error);
      throw error; // Re-throw the error
    } finally {
      await queryRunner.release();
      console.log("[ContentSeeder] QueryRunner released.");
    }
  }
}
