import * as fs from "fs";
import * as path from "path";
import { DataSource } from "typeorm";
import { Content } from "../../features/content/entities/content.entity";
import { Topic } from "../../features/topic/entities/topic.entity";
import { Unity } from "../../features/unity/entities/unity.entity";
import { DataSourceAwareSeed } from "./index";

// Import the consolidated dictionary JSON
import * as consolidatedDictionary from "../files/json/consolidated_dictionary.json";

export class ContentSeeder extends DataSourceAwareSeed {
  constructor(dataSource: DataSource) {
    super(dataSource);
  }

  async run(): Promise<void> {
    const contentRepository = this.dataSource.getRepository(Content);
    const unityRepository = this.dataSource.getRepository(Unity);
    const topicRepository = this.dataSource.getRepository(Topic);

    const unities = await unityRepository.find();
    const topics = await topicRepository.find();

    if (unities.length === 0) {
      console.log("No unities found. Skipping ContentSeeder.");
      return;
    }

    if (topics.length === 0) {
      console.log("No topics found. Skipping ContentSeeder.");
      return;
    }

    // Read estructura.json to get the paths to the other JSON files
    const estructuraPath = "src/database/files/json/estructura.json";
    const estructuraContent = JSON.parse(
      fs.readFileSync(estructuraPath, "utf-8")
    );

    // Iterate over the sections defined in estructura.json
    for (const sectionName in estructuraContent.estructura.secciones) {
      const sectionRelativePath = estructuraContent.estructura.secciones[sectionName];
      const sectionPath = path.resolve("src/database", sectionRelativePath);
      console.log(`Processing section: ${sectionName}`);

      let contentItems: any[] = [];
      let source = 'dedicated file';

      try {
        // Attempt to read the dedicated JSON file
        const sectionContent = JSON.parse(fs.readFileSync(sectionPath, "utf-8"));

        // Check if the content is directly an array
        if (Array.isArray(sectionContent)) {
          contentItems = sectionContent;
        } else if (typeof sectionContent === 'object' && sectionContent !== null) {
          // If not an array, check for known properties that contain arrays
          if (sectionName === 'alfabeto' && Array.isArray(sectionContent.letras)) {
            // For alfabeto.json, process the 'letras' array
            contentItems = sectionContent.letras.map((letra: string, index: number) => ({
              title: `Letra ${letra.toUpperCase()}`,
              description: `Información sobre la letra ${letra}`,
              type: 'alfabeto',
              content: { letra: letra, descripcion: sectionContent.descripcion }, // Store as structured object
              unityTitle: 'Bienvenida y Alfabeto', // Asignar a una unidad existente
              topicTitle: 'Alfabeto Kamëntsá', // Asignar a un tema existente
              order: index,
            }));
          } else if (sectionName === 'articulacion_detallada' && Array.isArray(sectionContent.sonidos_especificos)) {
             // For articulacion_detallada.json, process the 'sonidos_especificos' array
             contentItems = sectionContent.sonidos_especificos.map((sonido: any, index: number) => ({
               title: `Sonido ${sonido.sonido}`,
               description: sonido.descripcion_articulatoria,
               type: 'fonetica',
               content: sonido, // Store the whole object as content
               unityTitle: 'Vocales y Consonantes', // Asignar a una unidad existente
               topicTitle: 'Fonética y Pronunciación', // Asignar a un tema existente
               order: index,
             }));
          } else if (sectionName === 'saludos_despedidas' && Array.isArray(sectionContent.entradas)) {
              // For saludos_despedidas.json, process the 'entradas' array
              contentItems = sectionContent.entradas.map((entrada: any, index: number) => ({
                  title: entrada.camensta,
                  description: entrada.espanol,
                  type: 'expresion',
                  content: entrada, // Store the whole object
                  unityTitle: 'Saludos y Presentaciones', // Asignar a una unidad existente
                  topicTitle: 'Saludos', // Asignar a un tema existente
                  order: index,
              }));
          } else if (sectionName === 'expresiones_comunes' && Array.isArray(sectionContent.entradas)) {
               // For expresiones_comunes.json, process the 'entradas' array
               contentItems = sectionContent.entradas.map((entrada: any, index: number) => ({
                   title: entrada.camensta,
                   description: entrada.espanol,
                   type: 'expresion',
                   content: entrada, // Store the whole object
                   unityTitle: 'Conversación Cotidiana', // Asignar a una unidad existente
                   topicTitle: 'Expresiones Comunes', // Asignar a un tema existente
                   order: index,
               }));
          }
          // Add more conditions here for other known object structures if needed
        }

      } catch (error: any) {
        // If reading the dedicated file fails, try to find data in consolidated_dictionary.json
        console.log(`Dedicated file not found for section ${sectionName}. Attempting to use consolidated_dictionary.json`);
        source = 'consolidated dictionary';

        // Logic to extract data from consolidated_dictionary.json based on sectionName
        // This logic needs to be more sophisticated based on actual data structure and mapping
        const consolidatedSections = consolidatedDictionary.sections;
        const clasificadoresNominales = consolidatedDictionary.clasificadores_nominales.content;

        // Map sectionName to relevant data in consolidated_dictionary.json
        let relevantData: any[] = [];
        let contentType = 'informacion'; // Default type for consolidated content
        let unityTitle = 'Contenido del Diccionario'; // Default unity
        let topicTitle = 'Diccionario'; // Default topic

        if (sectionName === 'diccionario') {
            relevantData = [
                ...(consolidatedSections.diccionario.content.kamensta_espanol || []),
                ...(consolidatedSections.diccionario.content.espanol_kamensta || [])
            ];
            contentType = 'diccionario';
            unityTitle = 'Contenido del Diccionario';
            topicTitle = 'Uso del Diccionario';
        } else if (sectionName === 'introduccion') {
            relevantData = consolidatedSections.introduccion.content || [];
            contentType = 'texto';
            unityTitle = 'Introducción al Kamëntsá';
            topicTitle = 'General';
        } else if (sectionName === 'generalidades') {
             relevantData = consolidatedSections.generalidades.content || [];
             contentType = 'texto';
             unityTitle = 'Introducción al Kamëntsá';
             topicTitle = 'General';
        } else if (sectionName === 'fonetica') {
             // Extract relevant parts from the fonetica section
             const foneticaContent = consolidatedSections.fonetica.content;
             relevantData = [
                 ...(foneticaContent.vocales ? [{ title: 'Vocales', content: foneticaContent.vocales, type: 'fonetica-vocales' }] : []),
                 ...(foneticaContent.consonantes ? [{ title: 'Consonantes', content: foneticaContent.consonantes, type: 'fonetica-consonantes' }] : []),
                 ...(foneticaContent.combinaciones_sonoras ? [{ title: 'Combinaciones Sonoras', content: foneticaContent.combinaciones_sonoras, type: 'fonetica-combinaciones' }] : []),
                 ...(foneticaContent.alfabeto ? [{ title: 'Alfabeto', content: foneticaContent.alfabeto, type: 'fonetica-alfabeto' }] : []),
                 ...(foneticaContent.pronunciacion ? [{ title: 'Reglas de Pronunciación', content: foneticaContent.pronunciacion, type: 'fonetica-pronunciacion' }] : []),
                 ...(foneticaContent.patrones_acentuacion ? [{ title: 'Patrones de Acentuación', content: foneticaContent.patrones_acentuacion, type: 'fonetica-acentuacion' }] : []),
                 ...(foneticaContent.variaciones_dialectales ? [{ title: 'Variaciones Dialectales', content: foneticaContent.variaciones_dialectales, type: 'fonetica-variaciones' }] : []),
                 ...(foneticaContent.articulacion_detallada ? [{ title: 'Articulación Detallada', content: foneticaContent.articulacion_detallada, type: 'fonetica-articulacion' }] : []),
             ];
             contentType = 'fonetica';
             unityTitle = 'Fonética y Pronunciación';
             topicTitle = 'Fonética y Pronunciación';
        } else if (sectionName === 'gramatica') {
             // Extract relevant parts from the gramatica section
             const gramaticaContent = consolidatedSections.gramatica.content;
             relevantData = [
                 ...(gramaticaContent.sustantivos ? [{ title: 'Sustantivos', content: gramaticaContent.sustantivos, type: 'gramatica-sustantivos' }] : []),
                 ...(gramaticaContent.verbos ? [{ title: 'Verbos', content: gramaticaContent.verbos, type: 'gramatica-verbos' }] : []),
                 ...(gramaticaContent.pronombres ? [{ title: 'Pronombres', content: gramaticaContent.pronombres, type: 'gramatica-pronombres' }] : []),
                 // Add other grammar sections as needed
             ];
             contentType = 'gramatica';
             unityTitle = 'Gramática Fundamental';
             topicTitle = 'Gramática Básica';
        } else if (sectionName === 'recursos') {
             // Extract relevant parts from the recursos section
             const recursosContent = consolidatedSections.recursos.content;
             relevantData = [
                 ...(recursosContent.ejemplos ? recursosContent.ejemplos.map((ej: any) => ({ title: ej.titulo, content: ej.contenido, type: 'recursos-ejemplo' })) : []),
                 ...(recursosContent.referencias ? recursosContent.referencias.map((ref: any) => ({ title: ref.titulo, content: ref.contenido, type: 'recursos-referencia' })) : []),
                 ...(recursosContent.anexos ? recursosContent.anexos.map((an: any) => ({ title: an.titulo, content: an.contenido, type: 'recursos-anexo' })) : []),
             ];
             contentType = 'recursos';
             unityTitle = 'Contenido del Diccionario'; // Or a more specific unity if available
             topicTitle = 'General'; // Or a more specific topic
        } else if (sectionName === 'clasificadores_nominales') {
             relevantData = clasificadoresNominales || [];
             contentType = 'clasificador';
             unityTitle = 'Gramática Fundamental'; // Or a more specific unity
             topicTitle = 'Gramática Básica'; // Or a more specific topic
        }
        // Add more mappings for other sections in estructura.json to consolidated_dictionary.json

        // Map relevant data to contentItems format
        contentItems = relevantData.map((item: any, index: number) => {
            let title = item.title || item.entrada || `Item ${index}`;
            let description = item.description || (item.significados ? item.significados.map((sig: any) => sig.definicion).join(', ') : '') || (item.equivalentes ? item.equivalentes.map((eq: any) => eq.palabra).join(', ') : '') || JSON.stringify(item.content) || 'No description available';
            let content = item.content || item; // Store the relevant part or the whole item
            let type = item.type || contentType;

            // Refine unity and topic based on item content if needed
            if (type === 'diccionario') {
                 unityTitle = 'Vocabulario General'; // More specific unity for dictionary entries
                 topicTitle = item.tipo || 'Diccionario'; // Use dictionary entry type as topic
            } else if (type === 'clasificador') {
                 unityTitle = 'Gramática Fundamental';
                 topicTitle = 'Sustantivos'; // Or a more specific topic related to nouns
            }
            // Add more specific unity/topic mappings based on content type or title

            return {
                title: title,
                description: description,
                type: type,
                content: content, // Store as object/array
                unityTitle: unityTitle,
                topicTitle: topicTitle,
                order: index,
            };
        });


        // Log if no relevant entries were found
        if (contentItems.length === 0) {
            console.log(`No relevant entries found in consolidated_dictionary.json for section: ${sectionName}. Skipping.`);
        }
      }

      if (contentItems.length > 0) {
        for (const contentData of contentItems) {
          const existingContent = await contentRepository.findOne({
            where: { title: contentData.title },
          });

          if (!existingContent) {
            // Find the correct Unity and Topic based on contentData.unityTitle and contentData.topicTitle
            // Need to ensure these Unities and Topics exist or handle cases where they don't
            const unity = unities.find(
              (u) => u.title === contentData.unityTitle
            );
            const topic = topics.find(
              (t) => t.title === contentData.topicTitle
            );

            if (unity && topic) {
              const newContent = contentRepository.create();
              newContent.title = contentData.title;
              newContent.description = contentData.description;
              newContent.type = contentData.type;
              newContent.content = contentData.content; // Store as object/array
              newContent.unity = unity;
              newContent.unityId = unity.id;
              newContent.topic = topic;
              newContent.topicId = topic.id;
              newContent.order = contentData.order;

              await contentRepository.save(newContent);
              console.log(
                `Content "${contentData.title}" seeded from ${source} for section ${sectionName}.`
              );
            } else {
              console.log(
                `Unity "${contentData.unityTitle}" or Topic "${contentData.topicTitle}" not found for Content "${contentData.title}" from ${source} for section ${sectionName}. Skipping.`
              );
            }
          } else {
            console.log(
              `Content "${contentData.title}" already exists. Skipping.`
            );
          }
        }
      } else {
          console.log(`No content items found or processed for section: ${sectionName}. Skipping.`);
      }
    }
  }
}
