import * as fs from 'fs';
import * as path from 'path';
import { DataSource, In } from 'typeorm';
import { DataSourceAwareSeed } from './data-source-aware-seed';
import { Unity } from '../../features/unity/entities/unity.entity';
import { Lesson } from '../../features/lesson/entities/lesson.entity';
import { Content } from '../../features/content/entities/content.entity';
import { Vocabulary } from '../../features/vocabulary/entities/vocabulary.entity';

export class LessonRelationsSeeder extends DataSourceAwareSeed {
  constructor(dataSource: DataSource) {
    super(dataSource);
  }

  async run(): Promise<void> {
    console.log('[LessonRelationsSeeder] Starting to run seeder.');
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const unityRepository = queryRunner.manager.getRepository(Unity);
      const lessonRepository = queryRunner.manager.getRepository(Lesson);
      const contentRepository = queryRunner.manager.getRepository(Content);
      const vocabularyRepository = queryRunner.manager.getRepository(Vocabulary);

      // Read lesson_mappings.json
      const lessonMappingsPath = path.resolve(
        __dirname,
        '../files/json/lesson_mappings.json',
      );
      let lessonMappings: any;
      try {
        lessonMappings = JSON.parse(
          fs.readFileSync(lessonMappingsPath, 'utf-8'),
        );
        console.log(`[LessonRelationsSeeder] Successfully read lesson_mappings.json`);
      } catch (error: any) {
        console.error(
          `[LessonRelationsSeeder] Error reading lesson_mappings.json: ${error.message}`,
        );
        await queryRunner.rollbackTransaction();
        await queryRunner.release();
        return;
      }

      if (lessonMappings && Array.isArray(lessonMappings.units)) {
        for (const unitData of lessonMappings.units) {
          const unit = await unityRepository.findOne({ where: { title: unitData.title } });
          if (!unit) {
            console.warn(
              `[LessonRelationsSeeder] Unit "${unitData.title}" not found in DB. Skipping relations for this unit.`,
            );
            continue;
          }

          if (Array.isArray(unitData.lessons)) {
            for (const lessonData of unitData.lessons) {
              const lesson = await lessonRepository.findOne({ where: { id: lessonData.id }, relations: ['contents', 'vocabularies'] });
              if (!lesson) {
                console.warn(
                  `[LessonRelationsSeeder] Lesson "${lessonData.title}" (ID: ${lessonData.id}) not found in DB. Skipping relations for this lesson.`,
                );
                continue;
              }

              // Establish Content relations
              if (Array.isArray(lessonData.content_sections) && lessonData.content_sections.length > 0) {
                const contentMappingIds = lessonData.content_sections.map((s: any) => s.section_id);
                const contents = await contentRepository.findBy({ mappingId: In(contentMappingIds) });

                if (contents.length > 0) {
                  lesson.contents = contents;
                  console.log(`[LessonRelationsSeeder] Linked ${contents.length} content items to lesson "${lesson.title}".`);
                } else {
                  console.warn(`[LessonRelationsSeeder] No content found for lesson "${lesson.title}" with mapping IDs: ${contentMappingIds.join(', ')}.`);
                }
              }

              // Establish Vocabulary relations
              if (Array.isArray(lessonData.vocabulary_keywords) && lessonData.vocabulary_keywords.length > 0) {
                const vocabularies = await vocabularyRepository.findBy({ wordKamentsa: In(lessonData.vocabulary_keywords) });

                if (vocabularies.length > 0) {
                  lesson.vocabularies = vocabularies;
                  console.log(`[LessonRelationsSeeder] Linked ${vocabularies.length} vocabulary items to lesson "${lesson.title}".`);
                } else {
                  console.warn(`[LessonRelationsSeeder] No vocabulary found for lesson "${lesson.title}" with keywords: ${lessonData.vocabulary_keywords.join(', ')}.`);
                }
              }

              await lessonRepository.save(lesson);
              console.log(`[LessonRelationsSeeder] Saved relations for lesson "${lesson.title}".`);
            }
          }
        }
      } else {
        console.warn(
          "[LessonRelationsSeeder] lesson_mappings.json not found or has unexpected structure. No relations will be seeded.",
        );
      }

      await queryRunner.commitTransaction();
      console.log('[LessonRelationsSeeder] Seeding relations transaction committed successfully.');
    } catch (error) {
      await queryRunner.rollbackTransaction();
      console.error('[LessonRelationsSeeder] Error seeding relations:', error);
      throw error;
    } finally {
      await queryRunner.release();
      console.log('[LessonRelationsSeeder] QueryRunner released.');
    }
  }
}
