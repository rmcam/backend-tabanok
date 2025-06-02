
import { DataSource } from 'typeorm';
import { Comment } from '../../features/comments/entities/comment.entity';
import { ContentVersion } from '../../features/content-versioning/entities/content-version.entity';
import { User } from '../../auth/entities/user.entity';
import { DataSourceAwareSeed } from './data-source-aware-seed';
import * as fs from 'fs';
import * as path from 'path';

export class CommentSeeder extends DataSourceAwareSeed {
  constructor(dataSource: DataSource) {
    super(dataSource);
  }

  async run(): Promise<void> {
    const commentRepository = this.dataSource.getRepository(Comment);
    const contentVersionRepository = this.dataSource.getRepository(ContentVersion);
    const userRepository = this.dataSource.getRepository(User);
    const commentsJsonPath = path.resolve(__dirname, '../files/json/comments.json');

    try {
      const commentsJsonContent = JSON.parse(fs.readFileSync(commentsJsonPath, 'utf-8'));

      for (const commentData of commentsJsonContent) {
        const user = await userRepository.findOne({ where: { email: commentData.userEmail } });

        if (!user) {
          console.log(`User with email ${commentData.userEmail} not found. Skipping.`);
          continue;
        }

        const contentVersion = await contentVersionRepository.findOne({ where: { id: commentData.contentVersionId } });

        if (!contentVersion) {
          console.log(`Content Version with ID ${commentData.contentVersionId} not found. Skipping.`);
          continue;
        }

        const existingComment = await commentRepository.findOne({
          where: {
            content: commentData.content,
            version: { id: contentVersion.id },
          },
        });

        if (!existingComment) {
          const newComment = commentRepository.create({
            content: commentData.content,
            author: `${user.firstName} ${user.lastName}`,
            version: contentVersion,
            metadata: commentData.metadata,
            createdAt: commentData.createdAt ? new Date(commentData.createdAt) : new Date(),
          });
          await commentRepository.save(newComment);
          console.log(`Comment "${commentData.content}" seeded.`);
        } else {
          console.log(`Comment "${commentData.content}" already exists. Skipping.`);
        }
      }
      console.log('Comment seeder finished.');
    } catch (error) {
      console.error('Error seeding comments:', error);
    }
  }
}
