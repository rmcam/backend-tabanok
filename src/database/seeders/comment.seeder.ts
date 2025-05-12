
import { DataSource } from 'typeorm';
import { Comment } from '../../features/comments/entities/comment.entity';
import { ContentVersion } from '../../features/content-versioning/entities/content-version.entity';
import { User } from '../../auth/entities/user.entity'; // Import User
import { DataSourceAwareSeed } from './data-source-aware-seed';

export class CommentSeeder extends DataSourceAwareSeed {
  constructor(dataSource: DataSource) {
    super(dataSource);
  }

  async run(): Promise<void> {
    const commentRepository = this.dataSource.getRepository(Comment);
    const contentVersionRepository = this.dataSource.getRepository(ContentVersion);
    const userRepository = this.dataSource.getRepository(User); // Get User repository

    const contentVersions = await contentVersionRepository.find();
    const users = await userRepository.find(); // Get all users

    if (contentVersions.length === 0) {
      console.log('No content versions found. Skipping CommentSeeder.');
      return;
    }

    if (users.length === 0) {
        console.log('No users found. Skipping CommentSeeder.');
        return;
    }


    const commentsToSeed = [];
    const exampleComments = [
        'Excelente contenido, muy claro y útil.',
        'Tengo una duda sobre este punto, ¿podrían explicarlo mejor?',
        'Me gustó mucho la forma en que se presentó esta información.',
        'Creo que hay un pequeño error en la sección X.',
        'Muy interesante, aprendí algo nuevo hoy.',
        '¿Este contenido está relacionado con la unidad Y?',
        'Gracias por compartir este recurso.',
        'Sería útil tener más ejemplos prácticos.',
        '¿Hay alguna actividad asociada a este contenido?',
        'Buen trabajo en esta versión.',
    ];


    // Crear comentarios para algunas versiones de contenido
    for (const version of contentVersions) {
        // Add a random number of comments (0 to 3) per version
        const numComments = Math.floor(Math.random() * 4);

        for (let i = 0; i < numComments; i++) {
            const randomUser = users[Math.floor(Math.random() * users.length)]; // Assign a random user as author
            const randomCommentContent = exampleComments[Math.floor(Math.random() * exampleComments.length)];

            commentsToSeed.push({
                content: randomCommentContent,
                author: `${randomUser.firstName} ${randomUser.lastName}`, // Use user's name as author
                user: randomUser, // Associate the User entity
                userId: randomUser.id, // Associate userId
                version: version,
                versionId: version.id,
                metadata: { type: 'general', createdAt: new Date(version.createdAt.getTime() + (i + 1) * 60000) }, // Add creation date after version creation
                createdAt: new Date(version.createdAt.getTime() + (i + 1) * 60000), // Add creation date
            });
        }
    }

    // Use a single save call for efficiency
    await commentRepository.save(commentsToSeed);

    console.log(`Seeded ${commentsToSeed.length} comments.`);
    console.log('Comment seeder finished.');
  }
}
