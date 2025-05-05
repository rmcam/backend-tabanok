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

    const vocabularyToSeed = [
      {
        word: 'EjemploPalabra1',
        translation: 'ExampleWord1',
        description: 'Descripción de la palabra 1.',
        example: 'Uso de la palabra 1 en una oración.',
        audioUrl: null, // Agregar propiedad
        imageUrl: null, // Agregar propiedad
        points: 5, // Agregar propiedad con valor de ejemplo
        topicTitle: 'Vocales', // Asociar a un tema existente
      },
      {
        word: 'EjemploPalabra2',
        translation: 'ExampleWord2',
        description: 'Descripción de la palabra 2.',
        example: 'Uso de la palabra 2 en una oración.',
        audioUrl: 'http://example.com/audio_palabra2.mp3', // Agregar propiedad con valor de ejemplo
        imageUrl: null, // Agregar propiedad
        points: 10, // Agregar propiedad con valor de ejemplo
        topicTitle: 'Consonantes', // Asociar a un tema existente
      },
      // Agregar más vocabulario según sea necesario, asegurando que los topicTitle existan
    ];

    for (const vocabData of vocabularyToSeed) {
      const existingVocab = await vocabularyRepository.findOne({ where: { word: vocabData.word } });

      if (!existingVocab) {
        const topic = topics.find(t => t.title === vocabData.topicTitle);

        if (topic) {
          const newVocab = vocabularyRepository.create({
            word: vocabData.word,
            translation: vocabData.translation,
            description: vocabData.description,
            example: vocabData.example,
            audioUrl: vocabData.audioUrl,
            imageUrl: vocabData.imageUrl,
            points: vocabData.points,
            topic: topic,
          });
          await vocabularyRepository.save(newVocab);
          console.log(`Vocabulary "${vocabData.word}" seeded.`);
        } else {
          console.log(`Topic "${vocabData.topicTitle}" not found for Vocabulary "${vocabData.word}". Skipping.`);
        }
      } else {
        console.log(`Vocabulary "${vocabData.word}" already exists. Skipping.`);
      }
    }
  }
}
