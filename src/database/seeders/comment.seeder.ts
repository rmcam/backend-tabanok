import { DataSourceAwareSeed } from './index';
import { DataSource } from 'typeorm';
import { Comment } from '../../features/comments/entities/comment.entity';
import { ContentVersion } from '../../features/content-versioning/entities/content-version.entity';

export class CommentSeeder extends DataSourceAwareSeed {
  constructor(dataSource: DataSource) {
    super(dataSource);
  }

  async run(): Promise<void> {
    const commentRepository = this.dataSource.getRepository(Comment);
    const contentVersionRepository = this.dataSource.getRepository(ContentVersion);

    const contentVersions = await contentVersionRepository.find();

    if (contentVersions.length === 0) {
      console.log('No content versions found. Skipping CommentSeeder.');
      return;
    }

    const commentsToSeed = [];

    // Crear comentarios para algunas versiones de contenido
    for (const version of contentVersions) {
      // Comentario de ejemplo para una versión
      commentsToSeed.push({
        content: 'Este es un comentario de ejemplo sobre esta versión del contenido.',
        author: 'Usuario Ejemplo', // Usar un nombre de autor de ejemplo
        version: version,
        versionId: version.id,
        metadata: { type: 'general' },
      });

      // Agregar una respuesta a un comentario (si se implementan comentarios anidados)
      // Esto requeriría encontrar el comentario padre después de guardarlo, lo cual complica el seeder.
      // Por ahora, solo crearé comentarios de nivel superior.
    }

    for (const commentData of commentsToSeed) {
      // Buscar si ya existe un comentario con el mismo contenido y asociado a la misma versión
      const existingComment = await commentRepository.findOne({
        where: {
          content: commentData.content,
          version: { id: commentData.versionId },
        } as any, // Usar 'as any' temporalmente si hay problemas de tipo con la condición where
      });

      if (!existingComment) {
        const newComment = commentRepository.create(commentData);
        await commentRepository.save(newComment);
        console.log(`Comment for Content Version ID ${commentData.versionId} seeded.`);
      } else {
        console.log(`Comment for Content Version ID ${existingComment.version.id} with content "${existingComment.content}" already exists. Skipping.`);
      }
    }
  }
}
