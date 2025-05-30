import * as fs from 'fs';
import * as path from 'path';
import { DataSourceAwareSeed } from './data-source-aware-seed'; 
import { DataSource } from 'typeorm';
import { Lesson } from '../../features/lesson/entities/lesson.entity';
import { Unity } from '../../features/unity/entities/unity.entity';

export class LessonSeeder extends DataSourceAwareSeed {
  constructor(dataSource: DataSource) {
    super(dataSource);
  }

  async run(): Promise<void> {
    const lessonRepository = this.dataSource.getRepository(Lesson);
    const unityRepository = this.dataSource.getRepository(Unity);

    const unities = await unityRepository.find();

    if (unities.length === 0) {
      console.log('No unities found. Skipping LessonSeeder.');
      return;
    }

    // Crear un mapa de títulos de unidad a IDs de unidad para una asociación más robusta
    const unityTitleToIdMap = new Map<string, string>();
    unities.forEach(unity => {
      unityTitleToIdMap.set(unity.title, unity.id);
    });

    const lessonMappingsPath = path.resolve(__dirname, '../files/json/lesson_mappings.json');
    let lessonMappings: any;
    try {
      lessonMappings = JSON.parse(fs.readFileSync(lessonMappingsPath, 'utf-8'));
      console.log(`[LessonSeeder] Successfully read lesson_mappings.json`);
    } catch (error: any) {
      console.error(`[LessonSeeder] Error reading lesson_mappings.json: ${error.message}`);
      return;
    }

    const lessonsToSeed: { id: string; title: string; description: string; unityId: string; order: number }[] = [];

    if (lessonMappings && Array.isArray(lessonMappings.units)) {
      for (const unitData of lessonMappings.units) {
        const unit = unities.find(u => u.id === unitData.id); // Find unit by ID from mappings
        if (!unit) {
          console.warn(`[LessonSeeder] Unit "${unitData.title}" (ID: ${unitData.id}) not found in DB. Skipping lessons for this unit.`);
          continue;
        }

        if (Array.isArray(unitData.lessons)) {
          for (const lessonData of unitData.lessons) {
            lessonsToSeed.push({
              id: lessonData.id,
              title: lessonData.title,
              description: lessonData.description,
              unityId: unit.id, // Use the actual unit ID from the DB
              order: lessonData.order || 0,
            });
          }
        }
      }
    } else {
      console.warn("[LessonSeeder] lesson_mappings.json not found or has unexpected structure. No lessons will be seeded from mappings.");
    }

    for (const lessonData of lessonsToSeed) {
      const existingLesson = await lessonRepository.findOne({ where: { id: lessonData.id } }); // Check by ID for idempotency

      if (!existingLesson) {
        const unity = await unityRepository.findOne({ where: { id: lessonData.unityId } });
        if (unity) {
          const newLesson = lessonRepository.create({
            id: lessonData.id, // Use the ID from the mapping
            title: lessonData.title,
            description: lessonData.description,
            order: lessonData.order,
            unity: unity,
            unityId: unity.id,
          });
          await lessonRepository.save(newLesson);
          console.log(`[LessonSeeder] Lesson "${newLesson.title}" (ID: ${newLesson.id}) seeded.`);
        } else {
          console.warn(`[LessonSeeder] Unity with ID "${lessonData.unityId}" not found for Lesson "${lessonData.title}". Skipping.`);
        }
      } else {
        // Update existing lesson (optional, but good for idempotency)
        existingLesson.title = lessonData.title;
        existingLesson.description = lessonData.description;
        existingLesson.order = lessonData.order;
        // Ensure unity is correctly linked if it changed (though unit ID should be stable)
        const currentUnity = await unityRepository.findOne({ where: { id: lessonData.unityId } });
        if (currentUnity) {
            existingLesson.unity = currentUnity;
            existingLesson.unityId = currentUnity.id;
        }
        await lessonRepository.save(existingLesson);
        console.log(`[LessonSeeder] Lesson "${lessonData.title}" (ID: ${lessonData.id}) already exists and was updated.`);
      }
    }
  }
}
