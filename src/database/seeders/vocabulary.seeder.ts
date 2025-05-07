import * as fs from 'fs';
import * as path from 'path';
import { DataSourceAwareSeed } from './index';
import { DataSource } from 'typeorm';
import { Vocabulary } from '../../features/vocabulary/entities/vocabulary.entity';
import { Topic } from '../../features/topic/entities/topic.entity';

export class VocabularySeeder extends DataSourceAwareSeed {
  constructor(dataSource: DataSource) {
    super(dataSource);
  }

  async run(): Promise<void> {
    const vocabularyRepository = this.dataSource.getRepository(Vocabulary);
    const topicRepository = this.dataSource.getRepository(Topic);

    const topics = await topicRepository.find();

    if (topics.length === 0) {
      console.log('No topics found. Skipping VocabularySeeder.');
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

    for (const vocabData of vocabularyEntries) {
      const existingVocab = await vocabularyRepository.findOne({
        where: { word: vocabData.entrada },
      });

      if (!existingVocab) {
        // Intenta encontrar un tema basado en el tipo de palabra o palabras clave en la entrada/definiciones
        let topic = topics.find((t) => t.title === vocabData.tipo); // Try matching by type first

        if (!topic) {
            // If no topic found by type, try matching by keywords in the word or definitions
            const lowerWord = vocabData.entrada.toLowerCase();
            const definitions = vocabData.significados.map((s: any) => s.definicion.toLowerCase()).join(' ');

            topic = topics.find(t => {
                const lowerTopicTitle = t.title.toLowerCase();
                // Check if topic title is in the word or definitions
                return lowerWord.includes(lowerTopicTitle) || definitions.includes(lowerTopicTitle);
            });
        }

        // Use 'Vocabulario General' as a fallback if no specific topic is found
        if (!topic) {
             topic = topics.find(t => t.title === 'Vocabulario General');
        }


        if (topic) {
          const newVocab = vocabularyRepository.create({
            word: vocabData.entrada,
            translation: vocabData.significados
              .map((s: any) => s.definicion)
              .join('; '), // Concatenar definiciones
            description: vocabData.significados
              .map((s: any) => s.ejemplo)
              .filter((e: string) => e && e.trim() !== '') // Filter out empty examples
              .join('; '), // Concatenar ejemplos (solo si existen)
            example: vocabData.significados
              .map((s: any) => s.ejemplo)
               .filter((e: string) => e && e.trim() !== '') // Filter out empty examples
              .join('; '), // Usar ejemplos como campo de ejemplo (solo si existen)
            audioUrl: null, // No hay audio en el JSON proporcionado
            imageUrl: null, // No hay imagen en el JSON proporcionado
            points: 5, // Asignar puntos por defecto (ej. 5 puntos por palabra)
            topic: topic,
          });
          await vocabularyRepository.save(newVocab);
          console.log(`Vocabulary "${vocabData.entrada}" seeded with topic "${topic.title}".`);
        } else {
          console.log(
            `No suitable Topic found for Vocabulary "${vocabData.entrada}". Skipping.`,
          );
        }
      } else {
        console.log(`Vocabulary "${vocabData.entrada}" already exists. Skipping.`);
      }
    }
  }
}
