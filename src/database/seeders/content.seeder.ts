import * as fs from "fs";
import * as path from "path";
import { DataSource } from "typeorm"; // Import QueryRunner
import { Content } from "../../features/content/entities/content.entity";
import { Topic } from "../../features/topic/entities/topic.entity";
import { Unity } from "../../features/unity/entities/unity.entity";
import { DataSourceAwareSeed } from "./data-source-aware-seed";

// Import the consolidated dictionary JSON
import * as consolidatedDictionary from "../files/json/consolidated_dictionary.json";

export class ContentSeeder extends DataSourceAwareSeed {
  constructor(dataSource: DataSource) {
    super(dataSource);
  }

  async run(): Promise<void> {
    console.log("[ContentSeeder] Starting to run seeder.");
    const queryRunner = this.dataSource.createQueryRunner(); // Use QueryRunner for transaction
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const contentRepository = queryRunner.manager.getRepository(Content); // Use queryRunner.manager
      const unityRepository = queryRunner.manager.getRepository(Unity); // Use queryRunner.manager
      const topicRepository = queryRunner.manager.getRepository(Topic); // Use queryRunner.manager

      // Optional: Clear existing content for a clean seed (use with caution in production)
      // console.log("[ContentSeeder] Clearing existing content...");
      // await contentRepository.clear();
      // console.log("[ContentSeeder] Existing content cleared.");

      const unities = await unityRepository.find();
      console.log(`[ContentSeeder] Found ${unities.length} unities.`);

      const topics = await topicRepository.find();
      console.log(`[ContentSeeder] Found ${topics.length} topics.`);

      if (unities.length === 0) {
        console.log(
          "[ContentSeeder] No unities found. Skipping ContentSeeder."
        );
        await queryRunner.rollbackTransaction();
        await queryRunner.release();
        return;
      }

      if (topics.length === 0) {
        console.log("[ContentSeeder] No topics found. Skipping ContentSeeder.");
        await queryRunner.rollbackTransaction();
        await queryRunner.release();
        return;
      }

      // Create maps for quick lookup by title
      const unityMap = new Map<string, Unity>();
      unities.forEach((unity) => unityMap.set(unity.title, unity));

      const topicMap = new Map<string, Topic>();
      topics.forEach((topic) => topicMap.set(topic.title, topic));

      const contentItemsToSave: Content[] = [];
      const unitsWithContent = new Set<string>(); // Track units that have received content
      const placeholderContentToSave: Content[] = []; // Declare placeholderContentToSave here

      // Read lesson_mappings.json
      const lessonMappingsPath = path.resolve(
        __dirname,
        "../files/json/lesson_mappings.json"
      );
      console.log(
        `[ContentSeeder] Reading lesson_mappings.json from: ${lessonMappingsPath}`
      );

      let lessonMappings: any;
      try {
        lessonMappings = JSON.parse(
          fs.readFileSync(lessonMappingsPath, "utf-8")
        );
        console.log(`[ContentSeeder] Successfully read lesson_mappings.json`);
      } catch (error: any) {
        console.error(
          `[ContentSeeder] Error reading lesson_mappings.json: ${error.message}`
        );
        await queryRunner.rollbackTransaction();
        await queryRunner.release();
        return;
      }

      // Process units and lessons from lesson_mappings.json
      if (lessonMappings && Array.isArray(lessonMappings.units)) {
        for (const unitData of lessonMappings.units) {
          const unit = unityMap.get(unitData.title);
          if (!unit) {
            console.warn(
              `[ContentSeeder] Unit "${unitData.title}" not found in DB. Skipping content for this unit.`
            );
            continue;
          }
          unitsWithContent.add(unit.title); // Mark unit as having content from mappings

          // Create content for the unit itself (if needed, or just use it as a container)
          // For now, we'll focus on lessons and their content sections

          if (Array.isArray(unitData.lessons)) {
            for (const lessonData of unitData.lessons) {
              // Create a main content entry for the lesson itself
              const lessonContentTitle = lessonData.title;
              const lessonContentDescription = lessonData.description;
              const lessonContentType = "lesson-overview"; // A new type for lesson overview content
              const lessonContentOrder = lessonData.order || 0;

              const lessonTopic = topicMap.get(lessonData.topic || "general"); // Assuming a topic can be defined in lessonData or default to 'general'
              if (!lessonTopic) {
                console.warn(
                  `[ContentSeeder] Topic "${lessonData.topic || "general"}" not found for lesson "${lessonData.title}". Skipping.`
                );
                continue;
              }

              const newLessonContent = contentRepository.create({
                mappingId: lessonData.id, // Usar mappingId en lugar de id
                title: lessonContentTitle,
                description: lessonContentDescription,
                type: lessonContentType,
                content: lessonData, // Store lesson data as content JSONB
                unity: unit,
                unityId: unit.id,
                topic: lessonTopic,
                topicId: lessonTopic.id,
                order: lessonContentOrder,
                // vocabularyKeywords no se aplica a lesson-overview, se aplica a las subsecciones
              });
              contentItemsToSave.push(newLessonContent);

              // Process content sections for this lesson
              if (Array.isArray(lessonData.content_sections)) {
                for (const sectionRef of lessonData.content_sections) {
                  const sectionFilePath = path.resolve(
                    __dirname,
                    "../files/json",
                    sectionRef.file
                  );
                  let sectionContentData: any;

                  try {
                    sectionContentData = JSON.parse(
                      fs.readFileSync(sectionFilePath, "utf-8")
                    );
                  } catch (error: any) {
                    console.error(
                      `[ContentSeeder] Error reading content file ${sectionFilePath}: ${error.message}. Skipping section.`
                    );
                    continue;
                  }

                  let contentToExtract: any;
                  let contentTitle: string = "";
                  let contentDescription: string = "";
                  let contentType: string = "informacion";
                  let contentOrder: number = 0;
                  let vocabularyKeywords: string[] = [];

                  // Helper function to recursively find content by ID
                  const findContentById = (obj: any, id: string): any => {
                    if (typeof obj !== 'object' || obj === null) {
                      return null;
                    }
                    if (obj.id === id) {
                      return obj;
                    }
                    for (const key in obj) {
                      if (Object.prototype.hasOwnProperty.call(obj, key)) {
                        const found = findContentById(obj[key], id);
                        if (found) {
                          return found;
                        }
                      }
                    }
                    return null;
                  };

                  contentToExtract = findContentById(sectionContentData, sectionRef.section_id);

                  if (contentToExtract) {
                    // Determine title, description, type, order, and vocabularyKeywords based on the extracted content structure
                    contentTitle = contentToExtract.titulo || contentToExtract.title || contentToExtract.nombre || contentToExtract.symbol || contentToExtract.grupo || contentToExtract.tema || `Contenido de ${sectionRef.section_id}`;
                    contentDescription = contentToExtract.descripcion_general || contentToExtract.description || contentToExtract.detalles || contentToExtract.descripcion || contentToExtract.uso || `Descripción para ${contentTitle}`;
                    contentType = contentToExtract.type || sectionRef.file.replace(".json", "") + "-" + sectionRef.section_id.split('-')[0]; // Default type based on file and section prefix
                    contentOrder = contentToExtract.order || 0;
                    vocabularyKeywords = contentToExtract.vocabulary_keywords || [];

                    // Special handling for nested lists of vocabulary keywords (e.g., in examples)
                    if (contentToExtract.ejemplos && Array.isArray(contentToExtract.ejemplos)) {
                      contentToExtract.ejemplos.forEach((ej: any) => {
                        if (ej.vocabulary_keywords) {
                          vocabularyKeywords.push(...ej.vocabulary_keywords);
                        }
                      });
                    }
                    if (contentToExtract.items && Array.isArray(contentToExtract.items)) {
                      contentToExtract.items.forEach((item: any) => {
                        if (item.vocabulary_keywords) {
                          vocabularyKeywords.push(...item.vocabulary_keywords);
                        }
                        if (item.contenido && Array.isArray(item.contenido)) {
                          item.contenido.forEach((subItem: any) => {
                            if (subItem.vocabulary_keywords) {
                              vocabularyKeywords.push(...subItem.vocabulary_keywords);
                            }
                          });
                        }
                      });
                    }
                    if (contentToExtract.reglas && Array.isArray(contentToExtract.reglas)) {
                      contentToExtract.reglas.forEach((regla: any) => {
                        if (regla.vocabulary_keywords) {
                          vocabularyKeywords.push(...regla.vocabulary_keywords);
                        }
                        if (regla.ejemplos && Array.isArray(regla.ejemplos)) {
                          regla.ejemplos.forEach((ej: any) => {
                            if (ej.vocabulary_keywords) {
                              vocabularyKeywords.push(...ej.vocabulary_keywords);
                            }
                          });
                        }
                      });
                    }
                    if (contentToExtract.casos && Array.isArray(contentToExtract.casos)) {
                      contentToExtract.casos.forEach((caso: any) => {
                        if (caso.vocabulary_keywords) {
                          vocabularyKeywords.push(...caso.vocabulary_keywords);
                        }
                        if (caso.ejemplos && Array.isArray(caso.ejemplos)) {
                          caso.ejemplos.forEach((ej: any) => {
                            if (ej.vocabulary_keywords) {
                              vocabularyKeywords.push(...ej.vocabulary_keywords);
                            }
                          });
                        }
                      });
                    }
                    if (contentToExtract.caracteristicas && Array.isArray(contentToExtract.caracteristicas)) {
                      contentToExtract.caracteristicas.forEach((caracteristica: any) => {
                        if (caracteristica.vocabulary_keywords) {
                          vocabularyKeywords.push(...caracteristica.vocabulary_keywords);
                        }
                        if (caracteristica.ejemplos && Array.isArray(caracteristica.ejemplos)) {
                          caracteristica.ejemplos.forEach((ej: any) => {
                            if (ej.vocabulary_keywords) {
                              vocabularyKeywords.push(...ej.vocabulary_keywords);
                            }
                          });
                        }
                      });
                    }
                    // Ensure vocabularyKeywords are unique
                    vocabularyKeywords = [...new Set(vocabularyKeywords)];

                    const newContent = contentRepository.create({
                      mappingId: sectionRef.section_id,
                      title: contentTitle,
                      description: contentDescription,
                      type: contentType,
                      content: contentToExtract,
                      unity: unit,
                      unityId: unit.id,
                      topic: lessonTopic,
                      topicId: lessonTopic.id,
                      order: contentOrder,
                      vocabularyKeywords: vocabularyKeywords,
                    });
                    contentItemsToSave.push(newContent);
                  } else {
                    console.warn(
                      `[ContentSeeder] Could not find section_id "${sectionRef.section_id}" in file "${sectionRef.file}". Skipping.`
                    );
                  }
                }
              }
            }
          }
        }
      } else {
        console.warn(
          "[ContentSeeder] lesson_mappings.json not found or has unexpected structure. No content will be seeded from mappings."
        );
      }

      // Create placeholder content for units that didn't receive any content
      console.log("[ContentSeeder] Creating placeholder content for units without content...");
      const defaultPlaceholderTopic = topicMap.get("general"); // Use a default topic like 'general'

      if (!defaultPlaceholderTopic) {
          console.warn("[ContentSeeder] Default placeholder topic 'general' not found. Cannot create placeholder content.");
      } else {
          for (const unity of unities) {
              if (!unitsWithContent.has(unity.title)) {
                  console.log(`[ContentSeeder] Unit "${unity.title}" has no content. Creating placeholder.`);
                  const placeholderContent = contentRepository.create({
                      title: `Contenido de marcador de posición para ${unity.title}`,
                      description: `Este es un contenido de marcador de posición para la unidad "${unity.title}". El contenido real se añadirá más adelante.`,
                      type: "placeholder",
                      content: { message: "Contenido pendiente" },
                      unity: unity,
                      unityId: unity.id,
                      topic: defaultPlaceholderTopic, // Assign to a default topic
                      topicId: defaultPlaceholderTopic.id,
                      order: 0, // Default order
                  });
                  placeholderContentToSave.push(placeholderContent);
              }
          }
      }

      if (contentItemsToSave.length > 0 || placeholderContentToSave.length > 0) {
        const allContentToSave = [...contentItemsToSave, ...placeholderContentToSave];
        console.log(
          `[ContentSeeder] Saving ${allContentToSave.length} total content items (including placeholders)...`
        );
        // Use upsert for idempotency
        await contentRepository.upsert(allContentToSave, { // Changed to allContentToSave
          conflictPaths: ["mappingId"], // Conflict on 'mappingId'
          skipUpdateIfNoValuesChanged: true,
        });
        console.log("[ContentSeeder] Content seeded successfully.");
      } else {
        console.log("[ContentSeeder] No new content items to save.");
      }

      await queryRunner.commitTransaction();
      console.log(
        "[ContentSeeder] Seeding transaction committed successfully."
      );
    } catch (error) {
      await queryRunner.rollbackTransaction();
      console.error("[ContentSeeder] Error seeding content:", error);
      throw error; // Re-throw the error
    } finally {
      await queryRunner.release();
      console.log("[ContentSeeder] QueryRunner released.");
    }
  }
}
