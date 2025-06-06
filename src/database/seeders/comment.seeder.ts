
import { DataSource } from 'typeorm';
import { Comment } from '../../features/comments/entities/comment.entity';
import { ContentVersion } from '../../features/content-versioning/entities/content-version.entity';
import { DataSourceAwareSeed } from './data-source-aware-seed';

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

    const commentsToSeed: Partial<Comment>[] = [];

    interface CommentMetadata {
        type: "general" | "review" | "cultural" | "technical";
        [key: string]: any; // Allow other properties
    }

    interface InitialCommentData {
        content: string;
        author: string;
        metadata: CommentMetadata;
    }

    const initialComments: InitialCommentData[] = [
        { content: 'Excelente contenido, muy claro y útil.', author: 'System', metadata: { type: 'general' } },
        { content: 'Información fundamental para el inicio del aprendizaje.', author: 'System', metadata: { type: 'general' } },
    ];

    // Crear comentarios iniciales solo en entornos que no sean producción
    if (process.env.NODE_ENV !== 'production') {
      // Crear un comentario inicial para cada versión de contenido si no existe
      for (const version of contentVersions) {
          for (const commentData of initialComments) {
              const existingComment = await commentRepository.createQueryBuilder('comment')
                  .where('comment.content = :content', { content: commentData.content })
                  .andWhere('comment.versionId = :versionId', { versionId: version.id })
                  .getOne();

              if (!existingComment) {
                  commentsToSeed.push(
                      commentRepository.create({
                          content: commentData.content,
                          author: commentData.author,
                          versionId: version.id,
                          metadata: commentData.metadata,
                          isResolved: false, // Propiedad con valor por defecto
                          createdAt: new Date(),
                          // parentId, resolvedBy, resolvedAt, tags, mentions, attachments son nullable y no se necesitan para la inicialización
                          // version, parent, replies son relaciones y no se asignan directamente al crear
                      })
                  );
              } else {
                  console.log(`Comment "${commentData.content}" for version "${version.id}" already exists. Skipping.`);
              }
          }
      }

      // Use a single save call for efficiency
      await commentRepository.save(commentsToSeed);

      console.log(`Seeded ${commentsToSeed.length} comments (development environment).`);
    } else {
      console.log('Skipping CommentSeeder in production environment.');
    }

    console.log('Comment seeder finished.');
  }
}
