import { DataSourceAwareSeed } from './index';
import { DataSource } from 'typeorm';
import { Topic } from '../../features/topic/entities/topic.entity';
import { Unity } from '../../features/unity/entities/unity.entity';

export class TopicSeeder extends DataSourceAwareSeed {
  constructor(dataSource: DataSource) {
    super(dataSource);
  }

  async run(): Promise<void> {
    const topicRepository = this.dataSource.getRepository(Topic);
    const unityRepository = this.dataSource.getRepository(Unity);

    const unities = await unityRepository.find();

    if (unities.length === 0) {
      console.log('No unities found. Skipping TopicSeeder.');
      return;
    }

    const topicsToSeed = [
      { title: 'Vocales', description: 'Contenido sobre las vocales...', unityTitle: 'Vocales y Consonantes' },
      { title: 'Consonantes', description: 'Contenido sobre las consonantes...', unityTitle: 'Vocales y Consonantes' },
      // Agregar más temas para otras unidades/lecciones si es necesario
    ];

    for (const topicData of topicsToSeed) {
      const existingTopic = await topicRepository.findOne({ where: { title: topicData.title } });

      if (!existingTopic) {
        const unity = unities.find(u => u.title === topicData.unityTitle);
        if (unity) {
          const newTopic = topicRepository.create({
            title: topicData.title,
            description: topicData.description, // Usar description
            unity: unity,
            unityId: unity.id, // Asignar unityId
          });
          await topicRepository.save(newTopic);
          console.log(`Topic "${topicData.title}" seeded.`);
        } else {
          console.log(`Unity "${topicData.unityTitle}" not found for Topic "${topicData.title}". Skipping.`);
        }
      } else {
        console.log(`Topic "${topicData.title}" already exists. Skipping.`);
      }
    }
  }
}
