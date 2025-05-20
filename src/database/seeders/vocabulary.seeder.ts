import * as fs from 'fs';
import * as path from 'path';
import { DataSourceAwareSeed } from './data-source-aware-seed'; // Importar desde el nuevo archivo
import { DataSource } from 'typeorm';
import { Vocabulary } from '../../features/vocabulary/entities/vocabulary.entity';
import { Topic } from '../../features/topic/entities/topic.entity';

export class VocabularySeeder extends DataSourceAwareSeed {
  constructor(dataSource: DataSource) {
    super(dataSource);
  }

  async run(): Promise<void> {
    console.log('[VocabularySeeder] Starting to run seeder.');
    const vocabularyRepository = this.dataSource.getRepository(Vocabulary);
    const topicRepository = this.dataSource.getRepository(Topic);

    // Clear existing vocabulary entries
    console.log('[VocabularySeeder] Clearing existing vocabulary entries...');
    await vocabularyRepository.clear();
    console.log('[VocabularySeeder] Existing vocabulary entries cleared.');

    const topics = await topicRepository.find();
    console.log(`[VocabularySeeder] Found ${topics.length} topics.`);

    if (topics.length === 0) {
      console.log('[VocabularySeeder] No topics found. Skipping VocabularySeeder.');
      return;
    }

    const dictionaryPath = path.resolve(
      __dirname,
      '../../database/files/json/consolidated_dictionary.json',
    );
    console.log(`[VocabularySeeder] Dictionary path: ${dictionaryPath}`);
    console.log(`[VocabularySeeder] Reading dictionary file: ${dictionaryPath}`);
    let dictionaryContent: any;
    try {
      const fileContent = fs.readFileSync(dictionaryPath, 'utf-8');
      dictionaryContent = JSON.parse(fileContent);
      console.log(`[VocabularySeeder] Dictionary file read and parsed successfully.`);
    } catch (error) {
      console.error(`[VocabularySeeder] Error reading or parsing dictionary file: ${error.message}`);
      return;
    }


    const vocabularyEntries =
      dictionaryContent.sections?.diccionario?.content?.kamensta_espanol;
    console.log(`[VocabularySeeder] Found ${vocabularyEntries?.length || 0} entries in the dictionary file.`);
    if (!vocabularyEntries || !Array.isArray(vocabularyEntries)) {
      console.error('[VocabularySeeder] Vocabulary entries not found or not in expected format in dictionary content.');
      return;
    }

    const existingVocabularies = await vocabularyRepository.find({ select: ['word'] });
    const existingWords = new Set(existingVocabularies.map(vocab => vocab.word));
    console.log(`[VocabularySeeder] Found ${existingWords.size} existing vocabulary entries.`);

    const newVocabEntriesToSave: Vocabulary[] = [];

    // Crear un mapa de topics para búsqueda rápida por título
    const topicMap = new Map<string, Topic>();
    topics.forEach(topic => topicMap.set(topic.title, topic));

    for (const vocabData of vocabularyEntries) {
      const word = vocabData.entrada;
      console.log(`[VocabularySeeder] Processing vocabulary entry: "${word}"`);

      if (existingWords.has(word)) {
        console.log(`[VocabularySeeder] Vocabulary "${word}" already exists. Skipping.`);
        continue; // Saltar a la siguiente iteración si la palabra ya existe
      }

      console.log(`[VocabularySeeder] Seeding vocabulary: "${word}"`);
      // Intenta encontrar un tema basado en el tipo de palabra o palabras clave en la entrada/definiciones
      let topic = topicMap.get(vocabData.tipo); // Try matching by type first

      if (!topic) {
          // If no topic found by type, try matching by keywords in the word or definitions
          const lowerWord = word.toLowerCase();
          const definitions = vocabData.significados?.map((s: any) => s.definicion?.toLowerCase()).join(' ') || '';

          for (const t of topics) {
              const lowerTopicTitle = t.title.toLowerCase();
              // Check if topic title is in the word or definitions
              if (lowerWord.includes(lowerTopicTitle) || definitions.includes(lowerTopicTitle)) {
                  topic = t;
                  break;
              }
          }
      }

      // Use 'Vocabulario General' as a fallback if no specific topic is found
      if (!topic) {
           topic = topicMap.get('vocabulario general') || topicMap.get('Vocabulario General') || topicMap.get('Vocabulario general') || topicMap.get('Vocabulario General'.toLowerCase());
           if (topic) {
             console.log(`[VocabularySeeder] No specific topic found for "${word}", using "${topic.title}".`);
           } else {
             console.error(`[VocabularySeeder] Fallback topic 'Vocabulario General' not found. Cannot seed "${word}".`);
             continue; // Skip this vocabulary entry if fallback topic is missing
           }
      }


      if (topic) {
        console.log(`[VocabularySeeder] Found topic: ${topic.title} for vocabulary entry: "${word}"`);
        const newVocab = vocabularyRepository.create({
          id: this.dataSource.createQueryBuilder().connection.driver.options.type === 'postgres'
            ? this.dataSource.createQueryBuilder().connection.createQueryRunner().query('SELECT uuid_generate_v4()')[0]
            : undefined,
          word: word,
          translation: vocabData.significados
            ?.map((s: any) => s.definicion)
            .filter((d: string) => d && d.trim() !== '') // Filter out empty definitions
            .join('; ') || '', // Concatenar definiciones para translation
          description: vocabData.significados
            ?.map((s: any) => s.definicion) // Mapear definicion a description
            .filter((d: string) => d && d.trim() !== '') // Filter out empty definitions
            .join('; ') || '', // Concatenar definiciones para description
          example: vocabData.significados
            ?.map((s: any) => s.ejemplo)
            .filter((e: string) => e && e.trim() !== '') // Filter out empty examples
            .join('; ') || '', // Concatenar ejemplos (solo si existen) para example
          audioUrl: null, // No hay audio en el JSON proporcionado
          imageUrl: null, // No hay imagen en el JSON proporcionado
          points: 5, // Asignar puntos por defecto (ej. 5 puntos por palabra)
          topic: topic,
        });
        // Agregar la nueva entidad al array para inserción por lotes
        newVocabEntriesToSave.push(newVocab);
        console.log(`[VocabularySeeder] Prepared vocabulary "${word}" for batch insertion.`);
      } else {
          // Este bloque ahora solo se ejecutará si el topic 'Vocabulario General' no existe
          console.log(
            `[VocabularySeeder] Skipping Vocabulary "${word}" due to missing fallback topic.`,
          );
        }
    }

    // Realizar la inserción por lotes
    if (newVocabEntriesToSave.length > 0) {
        console.log(`[VocabularySeeder] Saving ${newVocabEntriesToSave.length} new vocabulary entries in batch.`);
        await vocabularyRepository.save(newVocabEntriesToSave);
        console.log('[VocabularySeeder] Batch insertion completed.');
    } else {
        console.log('[VocabularySeeder] No new vocabulary entries to save.');
    }

    console.log('[VocabularySeeder] Vocabulary seeding process finished.');
    console.log('[VocabularySeeder] Showing vocabulary IDs:');
    // Log vocabulary IDs
    const vocabularies = await vocabularyRepository.find({ select: ['id', 'word'] }); // Fetch only ID and word for logging
    vocabularies.forEach(vocabulary => {
      console.log(`[VocabularySeeder] Vocabulary ID: ${vocabulary.id}, Word: "${vocabulary.word}"`);
    });
  }
}
