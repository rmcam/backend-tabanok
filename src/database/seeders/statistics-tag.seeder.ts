import { DataSource } from 'typeorm';
import { DataSourceAwareSeed } from './index';
import { Tag } from '../../features/statistics/entities/statistics-tag.entity';
import { TagColor, TagType } from '../../features/statistics/interfaces/tag.interface';

export default class TagSeeder extends DataSourceAwareSeed {
  public constructor(dataSource: DataSource) {
    super(dataSource);
  }

  public async run(): Promise<void> {
    const repository = this.dataSource.getRepository(Tag);

    const tags: Partial<Tag>[] = [
      {
        name: 'Gramática',
        type: TagType.TOPIC, // Corregido a TOPIC
        color: TagColor.BLUE,
        description: 'Etiqueta para contenido relacionado con gramática.',
        usageCount: 10,
      },
      {
        name: 'Vocabulario',
        type: TagType.TOPIC, // Corregido a TOPIC
        color: TagColor.GREEN,
        description: 'Etiqueta para contenido relacionado con vocabulario.',
        usageCount: 15,
      },
      {
        name: 'Cultura',
        type: TagType.TOPIC, // Corregido a TOPIC
        color: TagColor.PURPLE,
        description: 'Etiqueta para contenido cultural.',
        usageCount: 5,
      },
      {
        name: 'Nivel Básico',
        type: TagType.CUSTOM,
        color: TagColor.GRAY,
        description: 'Etiqueta para contenido de nivel básico.',
        usageCount: 20,
      },
    ];

    const moreTags: Partial<Tag>[] = [
      {
        name: 'Pronunciación',
        type: TagType.TOPIC,
        color: TagColor.ORANGE,
        description: 'Etiqueta para contenido relacionado con pronunciación.',
        usageCount: 8,
      },
      {
        name: 'Nivel Intermedio',
        type: TagType.CUSTOM,
        color: TagColor.YELLOW,
        description: 'Etiqueta para contenido de nivel intermedio.',
        usageCount: 12,
      },
      {
        name: 'Historia Oral',
        type: TagType.TOPIC,
        color: TagColor.BROWN,
        description: 'Etiqueta para contenido de historia oral.',
        usageCount: 7,
      },
    ];

    tags.push(...moreTags);

    for (const tagData of tags) {
      const tag = repository.create(tagData);
      await repository.save(tag);
    }
  }
}
