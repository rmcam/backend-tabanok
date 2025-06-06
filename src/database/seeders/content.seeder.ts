import { DataSource } from "typeorm"; // Import QueryRunner
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

      const unities = await unityRepository.find();
      console.log(`[ContentSeeder] Found ${unities.length} unities.`);

      const topics = await topicRepository.find();
      console.log(`[ContentSeeder] Found ${topics.length} topics.`);

      if (unities.length === 0) {
        console.log(
          "[ContentSeeder] No unities found. Skipping ContentSeeder."
        );
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
      unities.forEach((unity) => unityMap.set(unity.title, unity));

      // Create map for quick lookup by topic title (lowercase for consistency)
      const topicMap = new Map<string, Topic>();
      topics.forEach((topic) => topicMap.set(topic.title.toLowerCase(), topic));


      const contentItemsToSave: Content[] = [];

      // Process data from consolidated_dictionary.json
      console.log(
        "[ContentSeeder] Processing data from consolidated_dictionary.json..."
      );
      console.log(
        "[ContentSeeder] Consolidated sections:",
        Object.keys(consolidatedDictionary.sections)
      );

      const consolidatedSections = consolidatedDictionary.sections;
      const clasificadoresNominales =
        consolidatedDictionary.clasificadores_nominales?.content; // Ensure it's accessed safely

      // Define a mapping from consolidated section names to default Unity and Topic titles
      const consolidatedSectionMapping: {
        [key: string]: { unity: string; topic: string; type?: string };
      } = {
        Introduccion: {
          unity: "Introducción al Kamëntsá",
          topic: "general", // Use lowercase for topic
          type: "texto",
        },
        Generalidades: {
          unity: "Introducción al Kamëntsá",
          topic: "general",
          type: "texto",
        },
        Fonetica: {
          unity: "Vocales y Consonantes",
          topic: "fonética y pronunciación",
          type: "fonetica",
        },
        Gramatica: {
          unity: "Gramática Fundamental",
          topic: "gramática básica",
          type: "gramatica",
        },
        Diccionario: {
          unity: "Vocabulario General",
          topic: "sin categoría", // Default for dictionary entries, will be refined by 'tipo'
          type: "diccionario",
        },
        Recursos: {
          unity: "Contenido del Diccionario",
          topic: "recursos adicionales",
          type: "recursos",
        },
        Alfabeto: {
          unity: "Vocales y Consonantes",
          topic: "alfabeto",
          type: "alfabeto",
        },
        ArticulacionDetallada: {
          unity: "Vocales y Consonantes",
          topic: "articulación detallada",
          type: "fonetica",
        },
        CombinacionesSonoras: {
          unity: "Vocales y Consonantes",
          topic: "combinaciones sonoras",
          type: "fonetica",
        },
        Consonantes: {
          unity: "Vocales y Consonantes",
          topic: "consonantes",
          type: "fonetica",
        },
        Numero: {
          unity: "Gramática Fundamental",
          topic: "número",
          type: "gramatica",
        },
        PatronesAcentuacion: {
          unity: "Vocales y Consonantes",
          topic: "patrones acentuación",
          type: "fonetica",
        },
        Pronombres: {
          unity: "Gramática Fundamental",
          topic: "pronombres",
          type: "gramatica",
        },
        Pronunciacion: {
          unity: "Vocales y Consonantes",
          topic: "pronunciación",
          type: "fonetica",
        },
        Sustantivos: {
          unity: "Gramática Fundamental",
          topic: "sustantivos",
          type: "gramatica",
        },
        VariacionesDialectales: {
          unity: "Vocales y Consonantes",
          topic: "variaciones dialectales",
          type: "fonetica",
        },
        Verbos: {
          unity: "Gramática Fundamental",
          topic: "verbos",
          type: "gramatica",
        },
        Vocales: {
          unity: "Vocales y Consonantes",
          topic: "vocales",
          type: "fonetica",
        },
        ClasificadoresNominales: {
          unity: "Gramática Fundamental",
          topic: "clasificadores nominales",
          type: "gramatica",
        },
      };

      // Helper function to format section names into titles
      const formatSectionTitle = (name: string) => {
        return name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
      };

      for (const sectionName in consolidatedSections) {
        const sectionData = consolidatedSections[sectionName];
        const mapping = consolidatedSectionMapping[sectionName];

        if (!mapping) {
          console.log(
            `[ContentSeeder] No mapping defined for consolidated section "${sectionName}". Skipping.`
          );
          continue;
        }

        let relevantData: any[] = [];
        let defaultContentType = mapping.type || "informacion";
        let defaultUnityTitle = mapping.unity;
        let defaultTopicTitle = mapping.topic;

        // --- Logic to extract and map data from consolidated_dictionary.json ---
        if (sectionName === "Diccionario") {
          console.log("[ContentSeeder] Skipping 'Diccionario' section as it's handled by VocabularySeeder.");
          continue; // Skip this section entirely
        } else if (sectionName === "Fonetica") {
          // Extract relevant parts from the fonetica section
          const foneticaContent = sectionData.content;
          relevantData = [
            ...(foneticaContent.vocales
              ? [
                  {
                    title: "Fonética: Vocales", // Título más específico
                    description: foneticaContent.vocales.descripcion, // Usar descripción específica si existe
                    content: foneticaContent.vocales,
                    type: "fonetica-vocales",
                  },
                ]
              : []),
            ...(foneticaContent.consonantes
              ? [
                  {
                    title: "Fonética: Consonantes", // Título más específico
                    description: foneticaContent.consonantes.descripcion, // Usar descripción específica si existe
                    content: foneticaContent.consonantes,
                    type: "fonetica-consonantes",
                  },
                ]
              : []),
            ...(foneticaContent.combinaciones_sonoras
              ? [
                  {
                    title: "Fonética: Combinaciones Sonoras", // Título más específico
                    description: foneticaContent.combinaciones_sonoras.descripcion, // Usar descripción específica si existe
                    content: foneticaContent.combinaciones_sonoras,
                    type: "fonetica-combinaciones",
                  },
                ]
              : []),
            ...(foneticaContent.alfabeto
              ? [
                  {
                    title: "Fonética: Alfabeto", // Título más específico
                    description: foneticaContent.alfabeto.descripcion, // Usar descripción específica si existe
                    content: foneticaContent.alfabeto,
                    type: "fonetica-alfabeto",
                  },
                ]
              : []),
            ...(foneticaContent.pronunciacion
              ? [
                  {
                    title: "Fonética: Reglas de Pronunciación", // Título más específico
                    description: foneticaContent.pronunciacion.descripcion, // Usar descripción específica si existe
                    content: foneticaContent.pronunciacion,
                    type: "fonetica-pronunciacion",
                  },
                ]
              : []),
            ...(foneticaContent.patrones_acentuacion
              ? [
                  {
                    title: "Fonética: Patrones de Acentuación", // Título más específico
                    description: foneticaContent.patrones_acentuacion.descripcion, // Usar descripción específica si existe
                    content: foneticaContent.patrones_acentuacion,
                    type: "fonetica-acentuacion",
                  },
                ]
              : []),
            ...(foneticaContent.variaciones_dialectales
              ? [
                  {
                    title: "Fonética: Variaciones Dialectales", // Título más específico
                    description: foneticaContent.variaciones_dialectales.descripcion, // Usar descripción específica si existe
                    content: foneticaContent.variaciones_dialectales,
                    type: "fonetica-variaciones",
                  },
                ]
              : []),
            ...(foneticaContent.articulacion_detallada
              ? [
                  {
                    title: "Fonética: Articulación Detallada", // Título más específico
                    description: foneticaContent.articulacion_detallada.descripcion, // Usar descripción específica si existe
                    content: foneticaContent.articulacion_detallada,
                    type: "fonetica-articulacion",
                  },
                ]
              : []),
          ];
          defaultTopicTitle = "fonética y pronunciación"; // Specific topic for fonetica
        } else if (sectionName === "Gramatica") {
          // Extract relevant parts from the gramatica section
          const gramaticaContent = sectionData.content;
          relevantData = [
            ...(gramaticaContent.sustantivos
              ? [
                  {
                    title: "Gramática: Sustantivos", // Título más específico
                    description: gramaticaContent.sustantivos.descripcion, // Usar descripción específica si existe
                    content: gramaticaContent.sustantivos,
                    type: "gramatica-sustantivos",
                  },
                ]
              : []),
            ...(gramaticaContent.verbos
              ? [
                  {
                    title: "Gramática: Verbos", // Título más específico
                    description: gramaticaContent.verbos.descripcion, // Usar descripción específica si existe
                    content: gramaticaContent.verbos,
                    type: "gramatica-verbos",
                  },
                ]
              : []),
            ...(gramaticaContent.pronombres
              ? [
                  {
                    title: "Gramática: Pronombres", // Título más específico
                    description: gramaticaContent.pronombres.descripcion, // Usar descripción específica si existe
                    content: gramaticaContent.pronombres,
                    type: "gramatica-pronombres",
                  },
                ]
              : []),
            ...(gramaticaContent.numero
              ? [
                  {
                    title: "Gramática: Número", // Título más específico
                    description: gramaticaContent.numero.descripcion, // Usar descripción específica si existe
                    content: gramaticaContent.numero,
                    type: "gramatica-numero",
                  },
                ]
              : []),
            // Add other grammar sections as needed
          ];
          defaultTopicTitle = "gramática básica"; // Specific topic for gramatica
        } else if (sectionName === "Recursos") {
          // Extract relevant parts from the recursos section
          const recursosContent = sectionData.content;
          relevantData = [
            ...(recursosContent.ejemplos
              ? recursosContent.ejemplos.contenido.map((ej: any) => ({ // Access 'contenido' array
                  title: `Recursos: ${ej.situacion}`, // Usar 'situacion' como título para ejemplos, prefijado
                  description: ej.nota || ej.espanol, // Usar nota o traducción como descripción
                  content: ej.dialogo || ej, // Usar dialogo o el objeto completo como contenido
                  type: "recursos-ejemplo",
                }))
              : []),
            ...(recursosContent.referencias
              ? [
                  {
                    title: `Recursos: ${recursosContent.referencias.titulo}`, // Título prefijado
                    description: recursosContent.referencias.descripcion, // Usar descripción específica si existe
                    content: recursosContent.referencias,
                    type: "recursos-referencia",
                  },
                ]
              : []),
            ...(recursosContent.anexos
              ? [
                  {
                    title: `Recursos: ${recursosContent.anexos.titulo}`, // Título prefijado
                    description: recursosContent.anexos.descripcion, // Usar descripción específica si existe
                    content: recursosContent.anexos,
                    type: "recursos-anexo",
                  },
                ]
              : []),
          ];
          defaultTopicTitle = "recursos adicionales"; // Specific topic for recursos
        } else if (sectionName === "ClasificadoresNominales" && clasificadoresNominales) {
          relevantData = clasificadoresNominales.map((clasificador: any) => ({
            title: `Gramática: Clasificador ${clasificador.sufijo}`, // Título más específico
            description: clasificador.significado, // Usar significado como descripción
            content: clasificador,
            type: "clasificador",
            unityTitle: "Gramática Fundamental", // Explicitly set unity for classifiers
            topicTitle: "clasificadores nominales", // Explicitly set topic for classifiers
          }));
        } else { // For simple sections like Introduccion, Generalidades, Alfabeto, etc.
          relevantData = [
            {
              title: sectionData.content?.titulo || sectionData.metadata?.title || formatSectionTitle(sectionName),
              description: sectionData.content?.descripcion || sectionData.metadata?.description,
              content: sectionData.content || sectionData,
              type: defaultContentType,
            },
          ];
        }
        // --- End of logic for consolidated_dictionary.json ---

        if (relevantData.length > 0) {
          console.log(
            `[ContentSeeder] Found ${relevantData.length} items in consolidated_dictionary.json for section: ${sectionName}.`
          );
          for (const item of relevantData) {
            let contentTitle =
              item.title ||
              item.entrada ||
              `Item ${contentItemsToSave.length + 1}`;
            let contentDescription: string;

            if (item.description) { // Si ya se extrajo una descripción en la fase de relevantData
              contentDescription = item.description;
            } else if (item.content && typeof item.content === 'object' && item.content.descripcion) { // Si item.content es un objeto y tiene una propiedad 'descripcion'
              contentDescription = item.content.descripcion;
            } else if (Array.isArray(item.content) && item.content.length > 0 && (item.content[0].nota || item.content[0].espanol)) { // Para recursos-ejemplo
              contentDescription = item.content[0].nota || item.content[0].espanol;
            } else if (item.significados) { // Para diccionario
              contentDescription = item.significados.map((sig: any) => sig.definicion).join("; ");
            } else if (item.equivalentes) { // Para diccionario
              contentDescription = item.equivalentes.map((eq: any) => eq.palabra).join("; ");
            } else {
              // Fallback si no se encuentra ninguna descripción específica
              contentDescription = "Contenido sin descripción específica.";
            }
            let contentType = item.type || defaultContentType;
            let contentContent = item.content || item; // Store the relevant part or the whole item

            // Determine Unity and Topic based on item data and default mapping
            let unityTitle = item.unityTitle || defaultUnityTitle;
            let topicTitle = item.topicTitle || defaultTopicTitle;

            // For dictionary entries, use the 'tipo' field for the topic title if available
            if (sectionName === "Diccionario" && item.tipo) {
              topicTitle = item.tipo.toLowerCase(); // Ensure topic is lowercase
              unityTitle = "Vocabulario General"; // Dictionary entries go to Vocabulario General
            }

            const unity = unityMap.get(unityTitle);
            const topic = topicMap.get(topicTitle); // Use lowercase topic title for lookup

            if (unity && topic) {
              // Check if content with the same title already exists to avoid duplicates
              const existingContent = contentItemsToSave.find(
                (c) => c.title === contentTitle && c.unityId === unity.id && c.topicId === topic.id
              );
              if (!existingContent) {
                const newContent = contentRepository.create({
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
                console.log(
                  `[ContentSeeder] Content with title "${contentTitle}" already prepared for saving in Unity "${unity.title}" and Topic "${topic.title}". Skipping duplicate from consolidated dictionary.`
                );
              }
            } else {
              console.warn(
                `[ContentSeeder] Unity "${unityTitle}" or Topic "${topicTitle}" not found for Content "${contentTitle}" from consolidated_dictionary.json for section ${sectionName}. Skipping.`
              );
              if (!unity)
                console.warn(
                  `[ContentSeeder] Unity "${unityTitle}" not found.`
                );
              if (!topic)
                console.warn(
                  `[ContentSeeder] Topic "${topicTitle}" not found.`
                );
            }
          }
        } else {
          console.log(
            `[ContentSeeder] No relevant content items found in consolidated_dictionary.json for section: ${sectionName}.`
          );
        }
      }

      if (contentItemsToSave.length > 0) {
        console.log(
          `[ContentSeeder] Saving ${contentItemsToSave.length} content items...`
        );
        // Use upsert for idempotency
        await contentRepository.upsert(contentItemsToSave, {
          conflictPaths: ["title", "unityId", "topicId"], // Define conflict strategy
          skipUpdateIfNoValuesChanged: true,
        });
        console.log("[ContentSeeder] Content seeded successfully.");
      } else {
        console.log("[ContentSeeder] No new content items to save.");
      }

      await queryRunner.commitTransaction();
      console.log(
        "[ContentSeeder] Seeding transaction committed successfully."
      );
    } catch (error) {
      await queryRunner.rollbackTransaction();
      console.error("[ContentSeeder] Error seeding content:", error);
      throw error; // Re-throw the error
    } finally {
      await queryRunner.release();
      console.log("[ContentSeeder] QueryRunner released.");
    }
  }
}
