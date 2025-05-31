import * as fs from "fs";
import * as path from "path";
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

      // Optional: Clear existing content for a clean seed (use with caution in production)
      // console.log("[ContentSeeder] Clearing existing content...");
      // await contentRepository.clear();
      // console.log("[ContentSeeder] Existing content cleared.");

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

      const topicMap = new Map<string, Topic>();
      topics.forEach((topic) => topicMap.set(topic.title, topic));

      // Read estructura.json to get the paths to the other JSON files
      const estructuraPath = path.resolve(
        __dirname,
        "../files/json/estructura.json"
      );
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
        console.error(
          `[ContentSeeder] Error reading estructura.json: ${error.message}`
        );
        // Continue processing, as consolidated_dictionary.json is an alternative source
      }

      const contentItemsToSave: Content[] = [];
      const processedSections = new Set<string>(); // Track sections processed from dedicated files
      const unitsWithContent = new Set<string>(); // Track units that have received content

      // Process sections defined in estructura.json first
      if (
        estructuraContent &&
        estructuraContent.estructura &&
        estructuraContent.estructura.secciones
      ) {
        for (const sectionName in estructuraContent.estructura.secciones) {
          const sectionRelativePath =
            estructuraContent.estructura.secciones[sectionName];
          const sectionPath = path.resolve(
            __dirname,
            "../",
            sectionRelativePath
          ); // Adjust path resolution

          // Check if the file exists before processing
          if (!fs.existsSync(sectionPath)) {
            console.log(
              `[ContentSeeder] Dedicated file not found: ${sectionPath}. Will attempt to use consolidated_dictionary.json for section ${sectionName}.`
            );
            continue; // Skip to the next section, will be handled by consolidated dictionary logic
          }
          console.log(
            `[ContentSeeder] Processing dedicated file for section: ${sectionName}, path: ${sectionPath}`
          );

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
            } else if (
              typeof sectionContent === "object" &&
              sectionContent !== null
            ) {
              // If not an array, check for known properties that contain arrays
              if (
                sectionName === "alfabeto" &&
                Array.isArray(sectionContent.letras)
              ) {
                contentItems = sectionContent.letras.map(
                  (letra: string, index: number) => ({
                    title: `Letra ${letra.toUpperCase()}`,
                    description: `Información sobre la letra ${letra}`,
                    type: "alfabeto",
                    content: {
                      letra: letra,
                      descripcion: sectionContent.descripcion,
                    },
                    unityTitle: "Bienvenida y Alfabeto",
                    topicTitle: "alfabeto", // Assuming a 'Alfabeto' topic exists
                    order: index,
                  })
                );
              } else if (
                sectionName === "articulacion_detallada" &&
                Array.isArray(sectionContent.sonidos_especificos)
              ) {
                contentItems = sectionContent.sonidos_especificos.map(
                  (sonido: any, index: number) => ({
                    title: `Sonido ${sonido.sonido}`,
                    description: sonido.descripcion_articulatoria,
                    type: "fonetica",
                    content: sonido,
                    unityTitle: "Vocales y Consonantes",
                    topicTitle: "Fonética", // Assuming a 'Fonética' topic exists
                    order: index,
                  })
                );
              } else if (
                sectionName === "saludos_despedidas" &&
                Array.isArray(sectionContent.entradas)
              ) {
                contentItems = sectionContent.entradas.map(
                  (entrada: any, index: number) => ({
                    title: entrada.camensta,
                    description: entrada.espanol,
                    type: "expresion",
                    content: entrada,
                    unityTitle: "Saludos y Presentaciones",
                    topicTitle: "Saludos y Despedidas", // Assuming a 'Saludos y Despedidas' topic exists
                    order: index,
                  })
                );
              } else if (
                sectionName === "expresiones_comunes" &&
                Array.isArray(sectionContent.entradas)
              ) {
                contentItems = sectionContent.entradas.map(
                  (entrada: any, index: number) => ({
                    title: entrada.camensta,
                    description: entrada.espanol,
                    type: "expresion",
                    content: entrada,
                    unityTitle: "Conversación Cotidiana", // Using the corrected Unity title
                    topicTitle: "Expresiones Comunes", // Assuming an 'Expresiones Comunes' topic exists
                    order: index,
                  })
                );
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
            console.log(
              `[ContentSeeder] Found ${contentItems.length} items in dedicated file for section: ${sectionName}.`
            );
            for (const contentData of contentItems) {
              const unity = unityMap.get(contentData.unityTitle);
              const topic = topicMap.get(
                contentData.topicTitle?.toLowerCase()?.trim() || ""
              );

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
                unitsWithContent.add(unity.title); // Track unit with content
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
        console.warn(
          "[ContentSeeder] estructura.json not found or has unexpected structure. Relying solely on consolidated_dictionary.json."
        );
      }

      // Process data from consolidated_dictionary.json for sections not processed from dedicated files
      console.log(
        "[ContentSeeder] Processing data from consolidated_dictionary.json..."
      );

      const consolidatedSections = consolidatedDictionary.sections;
      const clasificadoresNominales =
        consolidatedDictionary.clasificadores_nominales.content;

      // Define a mapping from consolidated section names to default Unity and Topic titles
      const consolidatedSectionMapping: {
        [key: string]: { unity: string; topic: string; type?: string };
      } = {
        introduccion: {
          unity: "Introducción al Kamëntsá",
          topic: "general",
          type: "texto",
        },
        generalidades: {
          unity: "Introducción al Kamëntsá",
          topic: "general",
          type: "texto",
        },
        // Mapping fonetica section to both Vocales y Consonantes and Fonética y Pronunciación
        fonetica: {
          unity: "Fonética y Pronunciación", // Mapped to this unit
          topic: "fonética",
          type: "fonetica",
        },
        gramatica: {
          unity: "Gramática Fundamental",
          topic: "gramática básica",
          type: "gramatica",
        },
        diccionario: {
          unity: "Vocabulario General",
          topic: "sin categoría",
          type: "diccionario",
        },
        recursos: {
          unity: "Contenido del Diccionario",
          topic: "recursos adicionales",
          type: "recursos",
        },
        // Add mappings for other sections corresponding to units
        cuerpo_humano: { unity: "El Cuerpo Humano", topic: "anatomía", type: "vocabulario" },
        familia: { unity: "La Familia", topic: "relaciones", type: "vocabulario" },
        comida: { unity: "Comida y Naturaleza", topic: "alimentos", type: "vocabulario" },
        colores: { unity: "Colores y Formas", topic: "adjetivos", type: "vocabulario" },
        animales: { unity: "Animales y Plantas Nativas", topic: "fauna", type: "vocabulario" },
        numeros: { unity: "Números y Cantidades", topic: "matemáticas", type: "vocabulario" },
        sentimientos: { unity: "Expresión de Sentimientos", topic: "emociones", type: "expresion" },
        musica: { unity: "La Música Kamëntsá", topic: "cultura", type: "cultura" },
        artesania: { unity: "Artesanía y Vestimenta", topic: "cultura", type: "cultura" },
        historia: { unity: "Historia del Pueblo Kamëntsá", topic: "historia", type: "historia" },
        verbos: { unity: "Tiempos Verbales Básicos", topic: "verbos", type: "gramatica" }, // Mapping for verbs section
        saludos: { unity: "Saludos y Presentaciones", topic: "expresiones", type: "expresion" },
        preguntas: { unity: "Conversación Cotidiana", topic: "conversacion", type: "expresion" },
        expresiones_comunes: { unity: "Conversación Cotidiana", topic: "expresiones", type: "expresion" },
        // Add mappings for remaining units
        // Estructura de la Oración -> Map to gramatica section (already covered by gramatica mapping)
        // Aspectos de la Vida Diaria -> Map to expresiones_comunes or diccionario (covered by existing mappings)
        // Direcciones y Lugares -> Map to expresiones_comunes or diccionario (covered by existing mappings)
        // Conceptos de Lectura -> Map to introduccion or generalidades (covered by existing mappings)
        // Práctica de Escritura -> Map to introduccion or generalidades (covered by existing mappings)
        // Fonética y Pronunciación -> Map fonetica section to this unit (added above)

        // "clasificadores_nominales" will be handled separately or mapped to a specific topic
      };

      for (const sectionName in consolidatedSections) {
        // Skip sections already processed from dedicated files
        if (processedSections.has(sectionName)) {
          console.log(
            `[ContentSeeder] Section "${sectionName}" already processed from dedicated file. Skipping consolidated dictionary.`
          );
          continue;
        }

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
        } else if (
          typeof sectionData.content === "object" &&
          sectionData.content !== null
        ) {
          // Handle cases where content is an object with nested data, e.g., generalidades with subtitulos
          // This part might need more specific logic based on the structure of each section
          if (
            sectionName === "generalidades" &&
            sectionData.content.subtitulos
          ) {
            relevantData = Object.entries(sectionData.content.subtitulos).map(
              ([subTitle, subContent]) => ({
                title: subTitle,
                description:
                  typeof subContent === "string"
                    ? subContent
                    : JSON.stringify(subContent),
                content: subContent,
                type: `${defaultContentType}-${subTitle.toLowerCase().replace(/\s+/g, "-")}`,
              })
            );
          } else {
            // Default handling for object content - might need refinement
            relevantData = [
              {
                title: sectionData.metadata?.title || sectionName,
                description:
                  sectionData.metadata?.description ||
                  `Content for ${sectionName}`,
                content: sectionData.content,
                type: defaultContentType,
              },
            ];
          }
        }
        // --- End of logic for consolidated_dictionary.json ---

        if (relevantData.length > 0) {
          console.log(
            `[ContentSeeder] Found ${relevantData.length} items in consolidated_dictionary.json for section: ${sectionName}.`
          );
          for (const item of relevantData) {
            let contentTitle =
              item.titulo || // Priorizar 'titulo' para secciones como introduccion/generalidades
              item.title ||
              item.entrada ||
              item.camensta ||
              `Item ${contentItemsToSave.length + 1}`; // Fallback genérico si no se encuentra nada
            let contentDescription =
              item.descripcion || // Priorizar 'descripcion' para secciones como introduccion/generalidades
              item.description ||
              item.espanol ||
              (item.significados && item.significados.length > 0
                ? item.significados.map((sig: any) => sig.definicion).join(", ")
                : "") ||
              (item.equivalentes && item.equivalentes.length > 0
                ? item.equivalentes.map((eq: any) => eq.palabra).join(", ")
                : "") ||
              (typeof item.content === "string" ? item.content : "Sin definición disponible"); // Usar "Sin definición disponible" si no hay otra opción
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
              contentDescription =
                typeof item.contenido === "string"
                  ? item.contenido
                  : JSON.stringify(item.contenido);
              contentContent = item.contenido;
              contentType = item.type || "recurso";
              unityTitle = "Contenido del Diccionario"; // Resources go to Contenido del Diccionario
              topicTitle = "Recursos Adicionales"; // Assuming a 'Recursos Adicionales' topic exists
            } else if (sectionName === "verbos" && item.infinitivo) {
              contentTitle = item.infinitivo;
              contentDescription = `Conjugaciones y usos del verbo ${item.infinitivo}`;
              contentContent = item; // Store the whole verb object
              contentType = "verbo";
              unityTitle = "Tiempos Verbales Básicos";
              topicTitle = "verbos";
            } else if (sectionName === "cuerpo_humano" && item.camensta) {
              contentTitle = item.camensta;
              contentDescription = item.espanol;
              contentContent = item;
              contentType = "vocabulario";
              unityTitle = "El Cuerpo Humano";
              topicTitle = "anatomía";
            } else if (sectionName === "familia" && item.camensta) {
              contentTitle = item.camensta;
              contentDescription = item.espanol;
              contentContent = item;
              contentType = "vocabulario";
              unityTitle = "La Familia";
              topicTitle = "relaciones";
            } else if (sectionName === "comida" && item.camensta) {
              contentTitle = item.camensta;
              contentDescription = item.espanol;
              contentContent = item;
              contentType = "vocabulario";
              unityTitle = "Comida y Naturaleza";
              topicTitle = "alimentos";
            } else if (sectionName === "colores" && item.camensta) {
              contentTitle = item.camensta;
              contentDescription = item.espanol;
              contentContent = item;
              contentType = "vocabulario";
              unityTitle = "Colores y Formas";
              topicTitle = "adjetivos";
            } else if (sectionName === "animales" && item.camensta) {
              contentTitle = item.camensta;
              contentDescription = item.espanol;
              contentContent = item;
              contentType = "vocabulario";
              unityTitle = "Animales y Plantas Nativas";
              topicTitle = "fauna";
            } else if (sectionName === "numeros" && item.camensta) {
              contentTitle = item.camensta;
              contentDescription = item.espanol;
              contentContent = item;
              contentType = "vocabulario";
              unityTitle = "Números y Cantidades";
              topicTitle = "matemáticas";
            } else if (sectionName === "sentimientos" && item.camensta) {
              contentTitle = item.camensta;
              contentDescription = item.espanol;
              contentContent = item;
              contentType = "expresion";
              unityTitle = "Expresión de Sentimientos";
              topicTitle = "emociones";
            } else if (sectionName === "musica" && item.titulo) {
              contentTitle = item.titulo;
              contentDescription = item.descripcion;
              contentContent = item;
              contentType = "cultura";
              unityTitle = "La Música Kamëntsá";
              topicTitle = "cultura";
            } else if (sectionName === "artesania" && item.titulo) {
              contentTitle = item.titulo;
              contentDescription = item.descripcion;
              contentContent = item;
              contentType = "cultura";
              unityTitle = "Artesanía y Vestimenta";
              topicTitle = "cultura";
            } else if (sectionName === "historia" && item.evento) {
              // Assuming history items have an 'evento' field
              contentTitle = item.evento;
              contentDescription = item.descripcion;
              contentContent = item;
              contentType = "historia";
              unityTitle = "Historia del Pueblo Kamëntsá";
              topicTitle = "historia";
            } else if (sectionName === "saludos" && item.camensta) {
              contentTitle = item.camensta;
              contentDescription = item.espanol;
              contentContent = item;
              contentType = "expresion";
              unityTitle = "Saludos y Presentaciones";
              topicTitle = "expresiones";
            } else if (sectionName === "preguntas" && item.camensta) {
              contentTitle = item.camensta;
              contentDescription = item.espanol;
              contentContent = item;
              contentType = "expresion";
              unityTitle = "Conversación Cotidiana"; // Or a new 'Preguntas y Respuestas' unit
              topicTitle = "conversacion";
            } else if (sectionName === "expresiones_comunes" && item.camensta) {
              contentTitle = item.camensta;
              contentDescription = item.espanol;
              contentContent = item;
              contentType = "expresion";
              unityTitle = "Conversación Cotidiana";
              topicTitle = "expresiones";
            }

            const unity = unityMap.get(unityTitle);
            const topic = topicMap.get(topicTitle);

            if (unity && topic) {
              // Check if content with the same title already exists to avoid duplicates
              const existingContent = contentItemsToSave.find(
                (c) => c.title === contentTitle
              );
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
                unitsWithContent.add(unity.title); // Track unit with content
              } else {
                console.log(
                  `[ContentSeeder] Content with title "${contentTitle}" already prepared for saving. Skipping duplicate from consolidated dictionary.`
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

      // Create placeholder content for units that didn't receive any content
      console.log("[ContentSeeder] Creating placeholder content for units without content...");
      const placeholderContentToSave: Content[] = [];
      const defaultPlaceholderTopic = topicMap.get("general"); // Use a default topic like 'general'

      if (!defaultPlaceholderTopic) {
          console.warn("[ContentSeeder] Default placeholder topic 'general' not found. Cannot create placeholder content.");
      } else {
          for (const unity of unities) {
              if (!unitsWithContent.has(unity.title)) {
                  console.log(`[ContentSeeder] Unit "${unity.title}" has no content. Creating placeholder.`);
                  const placeholderContent = contentRepository.create({
                      title: `Contenido de marcador de posición para ${unity.title}`,
                      description: `Este es un contenido de marcador de posición para la unidad "${unity.title}". El contenido real se añadirá más adelante.`,
                      type: "placeholder",
                      content: { message: "Contenido pendiente" },
                      unity: unity,
                      unityId: unity.id,
                      topic: defaultPlaceholderTopic, // Assign to a default topic
                      topicId: defaultPlaceholderTopic.id,
                      order: 0, // Default order
                  });
                  placeholderContentToSave.push(placeholderContent);
              }
          }
      }


      if (contentItemsToSave.length > 0 || placeholderContentToSave.length > 0) {
        const allContentToSave = [...contentItemsToSave, ...placeholderContentToSave];
        console.log(
          `[ContentSeeder] Saving ${allContentToSave.length} total content items (including placeholders)...`
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
