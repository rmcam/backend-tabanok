import * as fs from "fs";
import * as path from "path";
import { DataSource, EntityManager } from "typeorm";
import { Topic } from "../../features/topic/entities/topic.entity";
import { Vocabulary } from "../../features/vocabulary/entities/vocabulary.entity";
import { DataSourceAwareSeed } from "./data-source-aware-seed";

export class VocabularySeeder extends DataSourceAwareSeed {
  constructor(dataSource: DataSource) {
    super(dataSource);
  }

  /**
   * Intenta encontrar un Topic para una entrada de vocabulario.
   * La lógica de búsqueda sigue este orden de prioridad:
   * 1. Busca un Topic basado en el campo 'type' de la entrada (si existe).
   * 2. Si no se encuentra por 'type', busca palabras clave de los títulos de los Topics
   *    en una combinación del 'word', 'definitions', 'notes' y 'example' de la entrada.
   * 3. Si no se encuentra ningún Topic, retorna el Topic de 'Vocabulario General' como fallback.
   *
   * @param topics Lista completa de Topics disponibles.
   * @param topicMap Mapa de Topics para búsqueda rápida por título (en minúsculas).
   * @param generalVocabTopic El Topic de 'Vocabulario General' para usar como fallback.
   * @param type El campo 'type' de la entrada de vocabulario (opcional).
   * @param word La palabra en Kamëntsá o Español (opcional).
   * @param definitions Las definiciones de la entrada (opcional).
   * @param notes Las notas de la entrada (opcional).
   * @param example Un ejemplo de uso de la palabra (opcional).
   * @returns El Topic encontrado o el Topic de 'Vocabulario General'.
   */
  private findTopic(
    topics: Topic[],
    topicMap: Map<string, Topic>,
    generalVocabTopic: Topic,
    type?: string,
    word?: string,
    definitions?: string,
    notes?: string,
    example?: string
  ): Topic {
    let topic: Topic | undefined = undefined;

    // Intenta encontrar por el campo 'type'
    if (type) {
      topic = topicMap.get(type.toLowerCase());
      if (topic) {
        console.log(`[VocabularySeeder] findTopic: Found topic "${topic.title}" by type "${type}".`);
      } else {
        console.log(`[VocabularySeeder] findTopic: No topic found for type "${type}".`);
      }
    }

    // Si no se encontró por 'type', intenta buscar palabras clave en el texto combinado
    // Se prioriza la búsqueda en wordKamentsa, wordSpanish, definitions, notes y example para mayor precisión
    if (!topic && (word || definitions || notes || example)) {
      const combinedText = `${word?.toLowerCase() || ""} ${definitions?.toLowerCase() || ""} ${notes?.toLowerCase() || ""} ${example?.toLowerCase() || ""}`;
      console.log(`[VocabularySeeder] findTopic: Searching for topic keywords in combined text: "${combinedText.substring(0, 100)}..."`);
      for (const t of topics) {
        const lowerTopicTitle = t.title.toLowerCase();
        if (combinedText.includes(lowerTopicTitle)) {
          topic = t;
          console.log(`[VocabularySeeder] findTopic: Found topic "${topic.title}" by keyword in combined text.`);
          break;
        }
      }
      if (!topic) {
        console.log(`[VocabularySeeder] findTopic: No topic found by keyword in combined text.`);
      }
    }

    // Retorna el topic encontrado o el fallback
    if (topic) {
      console.log(`[VocabularySeeder] findTopic: Returning topic "${topic.title}".`);
    } else {
      console.log(`[VocabularySeeder] findTopic: Returning fallback topic "${generalVocabTopic.title}".`);
    }
    return topic || generalVocabTopic;
  }

  // Analizando la lógica de asignación de Topics
  async run(): Promise<void> {
    console.log("[VocabularySeeder] Starting to run seeder.");

    await this.dataSource.transaction(async (manager: EntityManager) => {
      console.log("[VocabularySeeder] Starting database transaction.");

      const vocabularyRepository = manager.getRepository(Vocabulary);
      const topicRepository = manager.getRepository(Topic);

      const topics = await topicRepository.find();
      console.log(`[VocabularySeeder] Found ${topics.length} topics.`);
      console.log('[VocabularySeeder] Loaded topics:', topics.map(topic => topic.title));

      if (topics.length === 0) {
        console.log(
          "[VocabularySeeder] No topics found. Skipping VocabularySeeder."
        );
        return; // Exit the transaction
      }

      const dictionaryPath = path.resolve(
        __dirname,
        "../../database/files/json/consolidated_dictionary.json"
      );
      console.log(`[VocabularySeeder] Dictionary path: ${dictionaryPath}`);
      console.log(
        `[VocabularySeeder] Reading dictionary file: ${dictionaryPath}`
      );
      let dictionaryContent: any;
      try {
        const fileContent = fs.readFileSync(dictionaryPath, "utf-8");
        dictionaryContent = JSON.parse(fileContent);
        console.log(
          `[VocabularySeeder] Dictionary file read and parsed successfully.`
        );
      } catch (error) {
        console.error(
          `[VocabularySeeder] Error reading or parsing dictionary file: ${error.message}`
        );
        throw error; // Re-throw to rollback transaction
      }

      const kamenstaEspanolEntries =
        dictionaryContent.sections?.Diccionario?.content?.kamensta_espanol || [];
      const espanolKamenstaEntries =
        dictionaryContent.sections?.Diccionario?.content?.espanol_kamensta || [];

      console.log(`[VocabularySeeder] Found ${kamenstaEspanolEntries.length} Kamëntsá-Español entries.`);
      console.log(`[VocabularySeeder] Found ${espanolKamenstaEntries.length} Español-Kamëntsá entries.`);

      const existingVocabularies = await vocabularyRepository.find({
        select: ["wordKamentsa"],
      });
      const existingWords = new Set(
        existingVocabularies.map((vocab) => vocab.wordKamentsa)
      );
      console.log(
        `[VocabularySeeder] Found ${existingWords.size} existing vocabulary entries.`
      );

      const newVocabEntriesToSave: Vocabulary[] = [];

      // Crear un mapa de topics para búsqueda rápida por título (en minúsculas)
      const topicMap = new Map<string, Topic>();
      topics.forEach((topic) => topicMap.set(topic.title.toLowerCase(), topic));

      // Obtener el topic de "Vocabulario General" para el fallback
      const generalVocabTopic = topicMap.get("vocabulario general");
      if (!generalVocabTopic) {
        console.error(
          "[VocabularySeeder] Fallback topic 'vocabulario general' not found. Cannot seed vocabulary entries without a default topic."
        );
        throw new Error("Fallback topic 'Vocabulario General' not found."); // Throw to rollback transaction
      }

      // Mapa para consolidar entradas por wordKamentsa
      const consolidatedEntries = new Map<string, any>();

      console.log("[VocabularySeeder] Consolidating Kamëntsá-Español entries...");
      // --- Consolidar entradas Kamëntsá-Español ---
      for (const vocabData of kamenstaEspanolEntries) {
        const word = vocabData.entrada;
        if (!word) {
          console.warn("[VocabularySeeder] Skipping Kamëntsá-Español entry with no word.");
          continue;
        }
        console.log(`[VocabularySeeder] Processing Kamëntsá-Español entry for "${word}".`);

        if (!consolidatedEntries.has(word)) {
          consolidatedEntries.set(word, {
            wordKamentsa: word,
            wordSpanish: new Set(), // Usaremos un Set para traducciones principales
            description: new Set(), // Usaremos un Set para descripciones/notas
            example: new Set(),
            audioUrl: vocabData.audioUrl || null,
            imageUrl: vocabData.imageUrl || null,
            points: vocabData.points || 5,
            type: vocabData.tipo || null,
            notes: new Set(),
          });
           console.log(`[VocabularySeeder] Created new consolidated entry for "${word}".`);
        }

        const entry = consolidatedEntries.get(word);

        // Añadir la primera definición como traducción principal si existe
        if (vocabData.significados && vocabData.significados.length > 0) {
            const primaryDefinition = vocabData.significados[0].definicion;
            if (primaryDefinition && primaryDefinition.trim() !== "") {
                entry.wordSpanish.add(primaryDefinition.trim());
                console.log(`[VocabularySeeder] Added primary Spanish definition to wordSpanish: "${primaryDefinition.trim()}" for "${word}".`);
            }

            // Añadir definiciones subsiguientes a la descripción
            if (vocabData.significados.length > 1) {
                for (let i = 1; i < vocabData.significados.length; i++) {
                    const subsequentDefinition = vocabData.significados[i].definicion;
                    if (subsequentDefinition && subsequentDefinition.trim() !== "") {
                        entry.description.add(subsequentDefinition.trim());
                        console.log(`[VocabularySeeder] Added subsequent Spanish definition to description: "${subsequentDefinition.trim()}" for "${word}".`);
                    }
                }
            }

            // Añadir ejemplos de la sección Kamëntsá-Español
            for (const significado of vocabData.significados) {
                if (significado.ejemplo && significado.ejemplo.trim() !== "") {
                    const exampleText = significado.traduccion_ejemplo && significado.traduccion_ejemplo.trim() !== ''
                        ? `${significado.ejemplo.trim()} (${significado.traduccion_ejemplo.trim()})`
                        : significado.ejemplo.trim();
                    entry.example.add(exampleText);
                    console.log(`[VocabularySeeder] Added example: "${exampleText}" for "${word}".`);
                }
            }
        }

        // Añadir notas de la sección Kamëntsá-Español a la descripción
        if (vocabData.notas && vocabData.notas.trim() !== '') {
          entry.description.add(vocabData.notas.trim());
          console.log(`[VocabularySeeder] Added notes to description: "${vocabData.notas.trim()}" for "${word}".`);
        }


        // Consolidar audioUrl/imageUrl/points/type (prioriza la primera entrada encontrada)
        if (vocabData.audioUrl && !entry.audioUrl) {
          entry.audioUrl = vocabData.audioUrl;
          console.log(`[VocabularySeeder] Set audioUrl: "${vocabData.audioUrl}" for "${word}".`);
        }
        if (vocabData.imageUrl && !entry.imageUrl) {
          entry.imageUrl = vocabData.imageUrl;
          console.log(`[VocabularySeeder] Set imageUrl: "${vocabData.imageUrl}" for "${word}".`);
        }
        if (vocabData.points && entry.points === 5) { // Priorizar puntos del JSON si no son los por defecto
          entry.points = vocabData.points;
          console.log(`[VocabularySeeder] Set points: ${vocabData.points} for "${word}".`);
        }
        if (vocabData.tipo && !entry.type) { // Priorizar tipo del JSON si no existe
          entry.type = vocabData.tipo;
          console.log(`[VocabularySeeder] Set type: "${vocabData.tipo}" for "${word}".`);
        }
      }

      console.log("[VocabularySeeder] Consolidating Español-Kamëntsá entries...");
      // --- Consolidar entradas Español-Kamëntsá ---
      // Estas entradas a menudo proporcionan traducciones y ejemplos adicionales para palabras Kamëntsá ya vistas.
      for (const vocabData of espanolKamenstaEntries) {
          const wordSpanish = vocabData.entrada;
          const equivalents = vocabData.equivalentes || [];
          console.log(`[VocabularySeeder] Processing Español-Kamëntsá entry for "${wordSpanish}".`);

          for (const equivalent of equivalents) {
              const wordKamentsa = equivalent.palabra;
              if (!wordKamentsa) {
                console.warn(`[VocabularySeeder] Skipping equivalent with no Kamëntsá word in entry "${wordSpanish}".`);
                continue;
              }
              console.log(`[VocabularySeeder] Processing equivalent "${wordKamentsa}" in entry "${wordSpanish}".`);

              if (!consolidatedEntries.has(wordKamentsa)) {
                   // Si la palabra Kamëntsá de la sección español-kamëntsá no existe, la añadimos
                  consolidatedEntries.set(wordKamentsa, {
                      wordKamentsa: wordKamentsa,
                      wordSpanish: new Set(),
                      description: new Set(),
                      example: new Set(),
                      audioUrl: equivalent.audioUrl || vocabData.audioUrl || null, // Capturar audio/imagen de equivalente o entrada
                      imageUrl: equivalent.imageUrl || vocabData.imageUrl || null,
                      points: equivalent.points || vocabData.points || 5,
                      type: equivalent.tipo || vocabData.tipo || null,
                      notes: new Set(),
                  });
                  console.log(`[VocabularySeeder] Created new consolidated entry for "${wordKamentsa}" from Español-Kamëntsá section.`);
              }

              const entry = consolidatedEntries.get(wordKamentsa);

              // Añadir la entrada en español como una traducción principal si no hay ninguna aún
              if (wordSpanish && wordSpanish.trim() !== '' && entry.wordSpanish.size === 0) {
                   entry.wordSpanish.add(wordSpanish.trim());
                   console.log(`[VocabularySeeder] Added Spanish word "${wordSpanish.trim()}" as primary translation for "${wordKamentsa}".`);
              }

              // Añadir notas si existen (de la entrada principal en español-kamëntsá o del equivalente) a la descripción
              if (vocabData.notas && vocabData.notas.trim() !== '') {
                  entry.description.add(vocabData.notas.trim());
                  console.log(`[VocabularySeeder] Added notes from Spanish entry to description: "${vocabData.notas.trim()}" for "${wordKamentsa}".`);
              }
               if (equivalent.notas && equivalent.notas.trim() !== '') {
                  entry.description.add(equivalent.notas.trim());
                  console.log(`[VocabularySeeder] Added notes from equivalent to description: "${equivalent.notas.trim()}" for "${wordKamentsa}".`);
              }

              // Añadir ejemplo y su traducción si existen
              if (equivalent.ejemplo && equivalent.ejemplo.trim() !== '') {
                  const exampleText = equivalent.traduccion_ejemplo && equivalent.traduccion_ejemplo.trim() !== ''
                      ? `${equivalent.ejemplo.trim()} (${equivalent.traduccion_ejemplo.trim()})`
                      : equivalent.ejemplo.trim();
                  entry.example.add(exampleText);
                  console.log(`[VocabularySeeder] Added example: "${exampleText}" for "${wordKamentsa}".`);
              }


              // Consolidar audioUrl/imageUrl/points/type si no existen en la entrada consolidada (prioriza Kamëntsá-Español)
              if (equivalent.audioUrl && !entry.audioUrl) {
                entry.audioUrl = equivalent.audioUrl;
                console.log(`[VocabularySeeder] Set audioUrl from equivalent: "${equivalent.audioUrl}" for "${wordKamentsa}".`);
              } else if (vocabData.audioUrl && !entry.audioUrl) {
                 entry.audioUrl = vocabData.audioUrl;
                 console.log(`[VocabularySeeder] Set audioUrl from Spanish entry: "${vocabData.audioUrl}" for "${wordKamentsa}".`);
              }

              if (equivalent.imageUrl && !entry.imageUrl) {
                entry.imageUrl = equivalent.imageUrl;
                console.log(`[VocabularySeeder] Set imageUrl from equivalent: "${equivalent.imageUrl}" for "${wordKamentsa}".`);
              } else if (vocabData.imageUrl && !entry.imageUrl) {
                 entry.imageUrl = vocabData.imageUrl;
                 console.log(`[VocabularySeeder] Set imageUrl from Spanish entry: "${vocabData.imageUrl}" for "${wordKamentsa}".`);
              }

              if (equivalent.points && entry.points === 5) {
                entry.points = equivalent.points;
                console.log(`[VocabularySeeder] Set points from equivalent: ${equivalent.points} for "${wordKamentsa}".`);
              } else if (vocabData.points && entry.points === 5) {
                 entry.points = vocabData.points;
                 console.log(`[VocabularySeeder] Set points from Spanish entry: ${vocabData.points} for "${wordKamentsa}".`);
              }

              if (equivalent.tipo && !entry.type) {
                entry.type = equivalent.tipo;
                console.log(`[VocabularySeeder] Set type from equivalent: "${equivalent.tipo}" for "${wordKamentsa}".`);
              } else if (vocabData.tipo && !entry.type) {
                 entry.type = vocabData.tipo;
                 console.log(`[VocabularySeeder] Set type from Spanish entry: "${vocabData.tipo}" for "${wordKamentsa}".`);
              }
          }
      }

      console.log(`[VocabularySeeder] Finished consolidating entries. Total unique Kamëntsá words: ${consolidatedEntries.size}.`);

      console.log("[VocabularySeeder] Creating Vocabulary entities...");
      // --- Crear entidades Vocabulary a partir de las entradas consolidadas ---
      for (const [wordKamentsa, vocabData] of consolidatedEntries.entries()) {
        if (existingWords.has(wordKamentsa)) {
          console.log(`[VocabularySeeder] Vocabulary "${wordKamentsa}" already exists. Skipping.`);
          continue;
        }

        console.log(`[VocabularySeeder] Preparing to seed vocabulary: "${wordKamentsa}"`);

        let finalWordSpanish = Array.from(vocabData.wordSpanish).join('; ');
        let descriptionParts: string[] = [];

        // Añadir notas y definiciones subsiguientes a las partes de la descripción
        if (vocabData.notes.size > 0) {
            descriptionParts.push(...Array.from(vocabData.notes).map(item => String(item)));
        }
        if (vocabData.description.size > 0) {
            descriptionParts.push(...Array.from(vocabData.description).map(item => String(item)));
        }

        // Eliminar duplicados y unir las partes de la descripción
        let finalDescription = Array.from(new Set(descriptionParts)).join('; ');

        // Heurística para mover la primera parte de la descripción a wordSpanish si wordSpanish está vacío
        // y la descripción parece contener la traducción principal.
        if (finalWordSpanish.trim() === '' && finalDescription.trim() !== '') {
            const parts = finalDescription.split(';');
            const potentialWordSpanish = parts[0].trim();
            // Considerar como traducción principal si no contiene paréntesis (tipo gramatical)
            // y no es demasiado corta (para evitar capturar solo un carácter o una palabra sin sentido)
            if (potentialWordSpanish.length > 0 && !potentialWordSpanish.includes('(') && potentialWordSpanish.length > 3) {
                finalWordSpanish = potentialWordSpanish;
                // Reconstruir finalDescription sin la parte movida
                finalDescription = parts.slice(1).map(p => p.trim()).filter(p => p !== '').join('; ');
            }
        }

        // Añadir el tipo gramatical a la descripción si existe
        if (vocabData.type && vocabData.type.trim() !== '') {
            const typeText = `(${vocabData.type.trim()})`;
            if (finalDescription !== '') {
                finalDescription += ` ${typeText}`;
            } else {
                finalDescription = typeText;
            }
        }

        const finalExample = Array.from(vocabData.example).join('; ');


        console.log(`[VocabularySeeder] Consolidated data for "${wordKamentsa}":`);
        console.log(`  Spanish: "${finalWordSpanish}"`);
        console.log(`  Description: "${finalDescription}"`);
        console.log(`  Example: "${finalExample}"`);
        console.log(`  AudioUrl: "${vocabData.audioUrl}"`);
        console.log(`  ImageUrl: "${vocabData.imageUrl}"`);
        console.log(`  Points: ${vocabData.points}`);
        console.log(`  Type: "${vocabData.type}"`);


        const topic = this.findTopic(
          topics,
          topicMap,
          generalVocabTopic,
          vocabData.type, // Usamos el tipo de la entrada consolidada
          wordKamentsa,
          finalWordSpanish, // Usamos la traducción principal para la búsqueda de topic
          finalDescription, // Usamos la descripción refinada para la búsqueda de topic
          finalExample,
        );

        if (topic) {
          console.log(`[VocabularySeeder] Assigned topic: ${topic.title} for "${wordKamentsa}".`);

          const newVocab = vocabularyRepository.create({
            wordKamentsa: wordKamentsa,
            wordSpanish: finalWordSpanish, // Usar la traducción principal consolidada
            description: finalDescription || null, // Usar descripción refinada o null si no hay descripción
            example: finalExample || null,
            audioUrl: vocabData.audioUrl,
            imageUrl: vocabData.imageUrl,
            points: vocabData.points,
            topic: topic,
          });
          newVocabEntriesToSave.push(newVocab);
          console.log(`[VocabularySeeder] Prepared vocabulary "${wordKamentsa}" for batch insertion.`);
        } else {
            console.log(
              `[VocabularySeeder] Skipping vocabulary "${wordKamentsa}" due to missing fallback topic. This should not happen if 'Vocabulario General' exists.`,
            );
          }
      }

      console.log(`[VocabularySeeder] Prepared ${newVocabEntriesToSave.length} new vocabulary entries for saving.`);

      // Realizar la inserción por lotes
      if (newVocabEntriesToSave.length > 0) {
          console.log(`[VocabularySeeder] Saving ${newVocabEntriesToSave.length} new vocabulary entries in batch.`);
          await vocabularyRepository.save(newVocabEntriesToSave);
          console.log('[VocabularySeeder] Batch insertion completed.');
      } else {
          console.log('[VocabularySeeder] No new vocabulary entries to save.');
      }

      console.log('[VocabularySeeder] Database transaction completed successfully.');
    }); // End of transaction

    console.log('[VocabularySeeder] Vocabulary seeding process finished.');
    console.log('[VocabularySeeder] Showing vocabulary IDs:');
    // Log vocabulary IDs (outside transaction, using original repository)
    // Note: This might not show entries from the current run if the transaction hasn't committed yet,
    // but for a seeder that runs once, it's usually fine. For long-running processes,
    // querying within the transaction or after commit is better.
    // Keeping it simple for this seeder example.
    const vocabularyRepository = this.dataSource.getRepository(Vocabulary);
    const vocabularies = await vocabularyRepository.find({ select: ['id', 'wordKamentsa', 'wordSpanish', 'description'] });
    vocabularies.forEach(vocabulary => {
      console.log(`[VocabularySeeder] Vocabulary ID: ${vocabulary.id}, Kamëntsá: "${vocabulary.wordKamentsa}", Spanish: "${vocabulary.wordSpanish}", Description: "${vocabulary.description}"`);
    });
  }
}
