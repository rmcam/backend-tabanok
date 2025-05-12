import { DataSource } from 'typeorm';
import { DataSourceAwareSeed } from './data-source-aware-seed'; 
import { Tag } from '../../features/statistics/entities/statistics-tag.entity';
import { TagColor, TagType } from '../../features/statistics/interfaces/tag.interface';

export class TagSeeder extends DataSourceAwareSeed {
  public constructor(dataSource: DataSource) {
    super(dataSource);
  }

  public async run(): Promise<void> {
    const tagRepository = this.dataSource.getRepository(Tag);

    const tagsToSeed: Partial<Tag>[] = [
      // Tags de Tema
      {
        name: 'Gramática',
        type: TagType.TOPIC,
        color: TagColor.BLUE,
        description: 'Etiqueta para contenido relacionado con gramática.',
        usageCount: Math.floor(Math.random() * 50) + 10, // Variar usageCount
      },
      {
        name: 'Vocabulario',
        type: TagType.TOPIC,
        color: TagColor.GREEN,
        description: 'Etiqueta para contenido relacionado con vocabulario.',
        usageCount: Math.floor(Math.random() * 80) + 20, // Variar usageCount
      },
      {
        name: 'Cultura',
        type: TagType.TOPIC,
        color: TagColor.PURPLE,
        description: 'Etiqueta para contenido cultural.',
        usageCount: Math.floor(Math.random() * 30) + 5, // Variar usageCount
      },
      {
        name: 'Pronunciación',
        type: TagType.TOPIC,
        color: TagColor.ORANGE,
        description: 'Etiqueta para contenido relacionado con pronunciación.',
        usageCount: Math.floor(Math.random() * 40) + 8, // Variar usageCount
      },
      {
        name: 'Historia Oral',
        type: TagType.TOPIC,
        color: TagColor.BROWN,
        description: 'Etiqueta para contenido de historia oral.',
        usageCount: Math.floor(Math.random() * 35) + 7, // Variar usageCount
      },
      {
        name: 'Rituales',
        type: TagType.TOPIC,
        color: TagColor.RED, // Nuevo color
        description: 'Etiqueta para contenido relacionado con rituales y ceremonias.',
        usageCount: Math.floor(Math.random() * 25) + 5,
      },
      {
        name: 'Artesanía',
        type: TagType.TOPIC,
        color: TagColor.YELLOW, // Nuevo color
        description: 'Etiqueta para contenido relacionado con artesanía.',
        usageCount: Math.floor(Math.random() * 20) + 4,
      },
      {
        name: 'Mitos y Leyendas',
        type: TagType.TOPIC,
        color: TagColor.BLUE, // Usar un color válido (BLUE)
        description: 'Etiqueta para contenido de mitos y leyendas.',
        usageCount: Math.floor(Math.random() * 28) + 6,
      },

      // Tags de Nivel
      {
        name: 'Nivel Básico',
        type: TagType.CUSTOM,
        color: TagColor.GRAY,
        description: 'Etiqueta para contenido de nivel básico.',
        usageCount: Math.floor(Math.random() * 60) + 20, // Variar usageCount
      },
      {
        name: 'Nivel Intermedio',
        type: TagType.CUSTOM,
        color: TagColor.YELLOW, // Usar un color diferente para nivel intermedio
        description: 'Etiqueta para contenido de nivel intermedio.',
        usageCount: Math.floor(Math.random() * 50) + 12, // Variar usageCount
      },
      {
        name: 'Nivel Avanzado',
        type: TagType.CUSTOM,
        color: TagColor.RED, // Usar un color diferente para nivel avanzado
        description: 'Etiqueta para contenido de nivel avanzado.',
        usageCount: Math.floor(Math.random() * 40) + 8,
      },

      // Tags de Tipo de Contenido
      {
        name: 'Texto',
        type: TagType.CUSTOM,
        color: TagColor.BLUE, // Usar un color diferente
        description: 'Etiqueta para contenido basado en texto.',
        usageCount: Math.floor(Math.random() * 70) + 15,
      },
      {
        name: 'Audio',
        type: TagType.CUSTOM,
        color: TagColor.GREEN, // Usar un color diferente
        description: 'Etiqueta para contenido de audio.',
        usageCount: Math.floor(Math.random() * 30) + 5,
      },
      {
        name: 'Video',
        type: TagType.CUSTOM,
        color: TagColor.PURPLE, // Usar un color diferente
        description: 'Etiqueta para contenido de video.',
        usageCount: Math.floor(Math.random() * 25) + 4,
      },
      {
        name: 'Imagen',
        type: TagType.CUSTOM,
        color: TagColor.ORANGE, // Usar un color diferente
        description: 'Etiqueta para contenido de imagen.',
        usageCount: Math.floor(Math.random() * 40) + 8,
      },
      {
        name: 'Interactivo',
        type: TagType.CUSTOM,
        color: TagColor.BROWN, // Usar un color diferente
        description: 'Etiqueta para contenido interactivo (ejercicios).',
        usageCount: Math.floor(Math.random() * 55) + 10,
      },
    ];


    for (const tagData of tagsToSeed) {
      const existingTag = await tagRepository.findOne({ where: { name: tagData.name } });

      if (!existingTag) {
        const newTag = tagRepository.create(tagData);
        await tagRepository.save(newTag);
        console.log(`Tag "${tagData.name}" seeded.`);
      } else {
        console.log(`Tag "${tagData.name}" already exists. Skipping.`);
      }
    }
  }
}
