import { DataSourceAwareSeed } from './index';
import { DataSource } from 'typeorm';
import { Content } from '../../features/content/entities/content.entity';
import { Unity } from '../../features/unity/entities/unity.entity';
import { Topic } from '../../features/topic/entities/topic.entity';

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
      console.log('No unities found. Skipping ContentSeeder.');
      return;
    }

    if (topics.length === 0) {
      console.log('No topics found. Skipping ContentSeeder.');
      return;
      }

    const contentToSeed = [
      {
        title: 'Introducción al Alfabeto',
        description: 'Contenido de texto sobre las letras del alfabeto Kamëntsá.',
        type: 'text',
        content: { text: 'Aquí va el contenido del texto sobre el alfabeto...' },
        unityTitle: 'Bienvenida y Alfabeto', // Usar título para encontrar la unidad
        topicTitle: 'Vocales', // Usar título para encontrar el tema
        order: 1,
      },
      {
        title: 'Video de Pronunciación de Vocales',
        description: 'Video explicando la pronunciación de las vocales.',
        type: 'video',
        content: { videoUrl: 'http://example.com/video_vocales.mp4' },
        unityTitle: 'Vocales y Consonantes',
        topicTitle: 'Vocales',
        order: 1,
      },
      {
        title: 'Quiz de Saludos',
        description: 'Evalúa tu conocimiento sobre saludos básicos.',
        type: 'quiz',
        content: { questions: [{ text: '¿Cómo saludas por la mañana?', options: ['Opción A', 'Opción B'] }] },
        unityTitle: 'Saludos y Presentaciones',
        topicTitle: 'Vocales', // Asumiendo que hay un tema general o se necesita ajustar
        order: 1,
      },
      // Agregar más contenido según sea necesario, asegurando que las unityTitle y topicTitle existan
    ];

    for (const contentData of contentToSeed) {
      const existingContent = await contentRepository.findOne({ where: { title: contentData.title } });

      if (!existingContent) {
        const unity = unities.find(u => u.title === contentData.unityTitle);
        const topic = topics.find(t => t.title === contentData.topicTitle);

        if (unity && topic) {
        const newContent = contentRepository.create();
        newContent.title = contentData.title;
        newContent.description = contentData.description;
        newContent.type = contentData.type;
        newContent.content = contentData.content;
        newContent.unity = unity;
        newContent.unityId = unity.id;
        newContent.topic = topic;
        newContent.topicId = topic.id;
        newContent.order = contentData.order;

        await contentRepository.save(newContent);
        console.log(`Content "${contentData.title}" seeded.`);
      } else {
        console.log(`Unity "${contentData.unityTitle}" or Topic "${contentData.topicTitle}" not found for Content "${contentData.title}". Skipping.`);
      }
    } else { // <-- Este else debe estar aquí
      console.log(`Content "${contentData.title}" already exists. Skipping.`);
    }
  }
}
}