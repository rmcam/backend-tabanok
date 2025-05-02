import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Content } from '../../features/content/entities/content.entity';
import { ContentVersion } from '../../features/content-versioning/entities/content-version.entity';
import { ContentValidation } from '../../features/content-validation/entities/content-validation.entity';
import { CulturalContent } from '../../features/cultural-content/cultural-content.entity';
import { Lesson } from '../../features/lesson/entities/lesson.entity';
import { Module } from '../../features/module/entities/module.entity';
import { Topic } from '../../features/topic/entities/topic.entity';
import { Unity } from '../../features/unity/entities/unity.entity';
import * as estructuraData from '../../../files/json/estructura.json'; // Import estructura.json
import * as fs from 'fs/promises'; // Import fs.promises for async file operations
import * as path from 'path'; // Import path module
import { Vocabulary } from '../../features/vocabulary/entities/vocabulary.entity'; // Import Vocabulary entity

@Injectable()
export class ContentSeeder {
  constructor(
    @InjectRepository(Content)
    private readonly contentRepository: Repository<Content>,
    @InjectRepository(ContentVersion)
    private readonly contentVersionRepository: Repository<ContentVersion>,
    @InjectRepository(ContentValidation)
    private readonly contentValidationRepository: Repository<ContentValidation>,
    @InjectRepository(CulturalContent)
    private readonly culturalContentRepository: Repository<CulturalContent>,
    @InjectRepository(Lesson)
    private readonly lessonRepository: Repository<Lesson>,
    @InjectRepository(Module)
    private readonly moduleRepository: Repository<Module>,
    @InjectRepository(Topic)
    private readonly topicRepository: Repository<Topic>,
    @InjectRepository(Unity)
    private readonly unityRepository: Repository<Unity>,
    @InjectRepository(Vocabulary) // Inject Vocabulary repository
    private readonly vocabularyRepository: Repository<Vocabulary>,
  ) {}

  async seed() {
    console.log('Starting Content seeding...');

    await this.seedModules();
    await this.seedLessons(); // Descomentado
    await this.seedVocabulary(); // Añadido llamado a seedVocabulary
    await this.seedCulturalContent(); // Descomentado

    console.log('Content seeding completed.');
  }

  private async seedModules() {
    console.log('Seeding Modules...');
    const moduleName = 'Curso Kamëntsá';
    let module = await this.moduleRepository.findOne({ where: { name: moduleName } });

    if (!module) {
      module = this.moduleRepository.create({
        name: moduleName,
        description: 'Curso completo del idioma Kamëntsá',
      });
      await this.moduleRepository.save(module);
      console.log(`Module "${moduleName}" created.`);
    } else {
      console.log(`Module "${moduleName}" already exists.`);
    }

    await this.seedUnities(module);
  }

  private async seedUnities(module: Module) {
    console.log('Seeding Unities...');
    const secciones = estructuraData.estructura.secciones;
    let order = 1;
    for (const key in secciones) {
      if (secciones.hasOwnProperty(key)) {
        const unityTitle = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()); // Convert key to title case
        let unity = await this.unityRepository.findOne({ where: { title: unityTitle, module: { id: module.id } } });

        if (!unity) {
          unity = this.unityRepository.create({
            title: unityTitle,
            description: `Contenido relacionado con ${unityTitle}`, // Placeholder description
            order: order++,
            module: module,
            // userId will need to be set - assuming an admin user exists after UserSeeder runs
            // For now, leaving it as is, will need to fetch an admin user later
          });
          await this.unityRepository.save(unity);
          console.log(`Unity "${unityTitle}" created.`);
        } else {
          console.log(`Unity "${unityTitle}" already exists.`);
        }

        // Read and process the content file for this unity
        const contentFilePath = path.join(__dirname, '..', '..', '..', secciones[key]);
        try {
          const contentFile = await fs.readFile(contentFilePath, 'utf-8');
          const contentData = JSON.parse(contentFile);
          console.log(`Successfully read content file: ${secciones[key]}`);

          // TODO: Implement logic to process contentData and seed Topics/Lessons/Content
          // This will depend on the structure of contentData (simple vs. nested)
          await this.processContentData(unity, contentData);

        } catch (error) {
          console.error(`Error reading or processing content file ${secciones[key]}:`, error);
        }
      }
    }
  }

  private async processContentData(unity: Unity, contentData: any) {
    console.log(`Processing content data for Unity "${unity.title}"...`);
    // Check if the content data has a simple structure (like introduccion.json)
    // A simple structure might be indicated by having keys that map directly to content pieces
    const isSimpleStructure = Object.keys(contentData).every(key =>
      typeof contentData[key] === 'string' || Array.isArray(contentData[key]) || typeof contentData[key] === 'object' && !Object.keys(contentData[key]).some(nestedKey => typeof contentData[key][nestedKey] === 'object')
    );


    if (isSimpleStructure) {
      console.log('Simple content structure detected.');
      // Create a single Topic or Lesson for the unity
      const topicTitle = `${unity.title} Overview`; // Or use unity title directly
      let topic = await this.topicRepository.findOne({ where: { title: topicTitle, unity: { id: unity.id } } });

      if (!topic) {
        topic = this.topicRepository.create({
          title: topicTitle,
          description: `Overview of ${unity.title}`, // Placeholder description
          order: 1,
          unity: unity,
        });
        await this.topicRepository.save(topic);
        console.log(`Topic "${topicTitle}" created for Unity "${unity.title}".`);
      } else {
        console.log(`Topic "${topicTitle}" already exists for Unity "${unity.title}".`);
      }

      // Create Content entities for each key-value pair in the simple structure
      let contentOrder = 1;
      for (const key in contentData) {
        if (contentData.hasOwnProperty(key)) {
          const contentValue = typeof contentData[key] === 'object' ? JSON.stringify(contentData[key]) : String(contentData[key]);
          const contentType = typeof contentData[key] === 'object' ? 'json' : 'text'; // Determine content type

          // Need a way to uniquely identify content to avoid duplicates.
          // For now, checking by topic and value (might not be sufficient for all cases)
          // const existingContent = await this.contentRepository.findOne({ where: { topic: { id: topic.id }, value: contentValue } });

          // if (!existingContent) {
            const content = this.contentRepository.create({
              type: contentType,
              content: contentValue, // Corregido: usar 'content' en lugar de 'value'
              order: contentOrder++,
              topic: topic, // Link content to the created topic
              // lesson: null, // Content is linked to topic, not lesson in this simple case
            });
            await this.contentRepository.save(content);
            console.log(`Content "${key}" created for Topic "${topicTitle}".`);
          // } else {
          //   console.log(`Content "${key}" already exists for Topic "${topicTitle}".`);
          // }
        }
      }

    } else {
      console.log('Nested content structure detected.');
      let topicOrder = 1;
      for (const key in contentData) {
        if (contentData.hasOwnProperty(key)) {
          const topicTitle = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()); // Convert key to title case
          let topic = await this.topicRepository.findOne({ where: { title: topicTitle, unity: { id: unity.id } } });

          if (!topic) {
            topic = this.topicRepository.create({
              title: topicTitle,
              description: `Contenido relacionado con ${topicTitle} en ${unity.title}`, // Placeholder description
              order: topicOrder++,
              unity: unity, // Link topic to the unity
            });
            await this.topicRepository.save(topic);
            console.log(`Topic "${topicTitle}" created for Unity "${unity.title}".`);
          } else {
            console.log(`Topic "${topicTitle}" already exists for Unity "${unity.title}".`);
          }

          // Implement logic to process the content within this nested section (contentData[key])
          // This will involve creating Lessons and Content under this new Topic.
          console.log(`Processing nested content for Topic "${topicTitle}"...`);
          const nestedContent = contentData[key];
          let contentOrder = 1;

          // Iterate over the properties within the nested content
          for (const nestedKey of Object.keys(nestedContent)) {
            if (nestedContent.hasOwnProperty(nestedKey)) {
              const contentValue = typeof nestedContent[nestedKey] === 'object' ? JSON.stringify(nestedContent[nestedKey]) : String(nestedContent[nestedKey]);
              const contentType = typeof nestedContent[nestedKey] === 'object' ? 'json' : 'text'; // Determine content type

              // Create Content entity for each nested key-value pair
              const content = this.contentRepository.create({
                type: contentType,
                content: contentValue,
                order: contentOrder++,
                topic: topic, // Link content to the created topic
                // lesson: null, // Content is linked to topic
              });
              await this.contentRepository.save(content);
              console.log(`Content "${nestedKey}" created for Topic "${topicTitle}".`);
            }
          }
        }
      }
    }
  }

  private async seedLessons() {
    console.log('Seeding Lessons...');
    const unityRepository = this.unityRepository; // Usar el repositorio inyectado
    const lessonRepository = this.lessonRepository; // Usar el repositorio inyectado

    // Obtener unidades existentes para asociar lecciones
    const unities = await unityRepository.find();

    if (unities.length === 0) {
      console.log('No unities found to link lessons. Skipping lesson seeding.');
      return;
    }

    // Lógica de seeding de lecciones adaptada de seed.ts
    const lessonsData = [
      {
        title: "Lección 1.1: ¡Hola!",
        description: "Primeros saludos",
        order: 1,
        isActive: true,
        // Asociar con la unidad correcta (ej. por título)
        unityTitle: "Unidad 1: Saludos y presentaciones",
      },
      {
        title: "Lección 1.2: ¿Cómo estás?",
        description: "Preguntando por el estado de ánimo",
        order: 2,
        isActive: true,
        unityTitle: "Unidad 1: Saludos y presentaciones",
      },
      {
        title: "Lección 2.1: Miembros directos",
        description: "Padre, madre, hijos",
        order: 1,
        isActive: true,
        unityTitle: "Unidad 2: La Familia",
      },
      {
        title: "Lección 2.2: Otros parientes",
        description: "Abuelos, tíos, primos",
        order: 2,
        isActive: true,
        unityTitle: "Unidad 2: La Familia",
      },
      {
        title: "Lección 3.1: Colores primarios",
        description: "Rojo, azul, amarillo",
        order: 1,
        isActive: true,
        unityTitle: "Unidad 3: Colores y Números",
      },
      {
        title: "Lección 3.2: Números básicos",
        description: "Contando del 1 al 5",
        order: 2,
        isActive: true,
        unityTitle: "Unidad 3: Colores y Números",
      },
    ];

    for (const lessonData of lessonsData) {
      const unity = unities.find(u => u.title === lessonData.unityTitle);

      if (!unity) {
        console.warn(`Unity "${lessonData.unityTitle}" not found for lesson "${lessonData.title}". Skipping.`);
        continue;
      }

      const existingLesson = await lessonRepository.findOne({
        where: { title: lessonData.title, unity: { id: unity.id } },
      });

      if (!existingLesson) {
        const lesson = lessonRepository.create({
          title: lessonData.title,
          description: lessonData.description,
          order: lessonData.order,
          isActive: lessonData.isActive,
          unity: unity,
        });
        await lessonRepository.save(lesson);
        console.log(`Lesson "${lesson.title}" created for Unity "${unity.title}".`);
      } else {
        console.log(`Lesson "${existingLesson.title}" already exists for Unity "${unity.title}".`);
      }
    }
  }

  private async seedVocabulary() {
    console.log('Seeding Vocabulary...');
    const topicRepository = this.topicRepository; // Usar el repositorio inyectado
    const vocabularyRepository = this.vocabularyRepository; // Usar el repositorio inyectado

    // Obtener temas existentes para asociar vocabulario
    const topics = await topicRepository.find();

    if (topics.length === 0) {
      console.log('No topics found to link vocabulary. Skipping vocabulary seeding.');
      return;
    }

    // Lógica de seeding de vocabulario fijo adaptada de seed.ts
    const additionalVocabularyData = [
      {
        word: "aiñe",
        translation: "hola",
        audioUrl: "http://example.com/audio/aine.mp3",
        imageUrl: "http://example.com/images/aine.jpg",
        example: "Aiñe, ¿chka ichmëna?",
        // Asociar con el tema correcto (ej. por título)
        topicTitle: "Saludos básicos",
      },
      {
        word: "bebmá",
        translation: "madre",
        audioUrl: "http://example.com/audio/bebma.mp3",
        imageUrl: "http://example.com/images/bebma.jpg",
        example: "Bebmá iyë",
        topicTitle: "Miembros de la familia",
      },
      {
        word: "taitá",
        translation: "padre",
        audioUrl: "http://example.com/audio/taita.mp3",
        imageUrl: "http://example.com/images/taita.jpg",
        example: "Taitá iyë",
        topicTitle: "Miembros de la familia",
      },
      {
        word: "ñá",
        translation: "rojo",
        audioUrl: "http://example.com/audio/ña.mp3",
        imageUrl: "http://example.com/images/ña.jpg",
        example: "Ñá tsbëng",
        topicTitle: "Colores",
      },
    ];

    for (const vocabData of additionalVocabularyData) {
      const topic = topics.find(t => t.title === vocabData.topicTitle);

      if (!topic) {
        console.warn(`Topic "${vocabData.topicTitle}" not found for vocabulary "${vocabData.word}". Skipping.`);
        continue;
      }

      const existingVocab = await vocabularyRepository.findOne({
        where: { word: vocabData.word, topic: { id: topic.id } },
      });

      if (!existingVocab) {
        const vocabulary = vocabularyRepository.create({
          word: vocabData.word,
          translation: vocabData.translation,
          audioUrl: vocabData.audioUrl,
          imageUrl: vocabData.imageUrl,
          example: vocabData.example,
          topic: topic,
        });
        await vocabularyRepository.save(vocabulary);
        console.log(`Vocabulary "${vocabulary.word}" created for Topic "${topic.title}".`);
      } else {
        console.log(`Vocabulary "${existingVocab.word}" already exists for Topic "${topic.title}".`);
      }
    }

    // Lógica de importación de diccionario consolidado adaptada de seed.ts
    const dictPath = path.resolve(
      __dirname,
      "../../../files/json/consolidated_dictionary.json"
    );
    console.log("Ruta del diccionario:", dictPath);

    try {
      await fs.access(dictPath); // Usar fs.promises.access para verificar existencia
      const dictRaw = await fs.readFile(dictPath, "utf-8"); // Usar fs.readFile asíncrono
      console.log("Tamaño del archivo JSON:", dictRaw.length, "bytes");

      const dictJson = JSON.parse(dictRaw);
        const entries = dictJson.diccionario?.content?.kamensta_espanol || [];
        if (
          !entries.length &&
          dictJson.sections?.diccionario?.content?.kamensta_espanol
        ) {
          console.log(
            "Intentando ruta alternativa en sections.diccionario.content.kamensta_espanol"
          );
          entries.push(
            ...dictJson.sections.diccionario.content.kamensta_espanol
          );
        }
        console.log(`Importando ${entries.length} entradas del diccionario...`);

        const dictionaryTopic = topics.find(
          (topic) => topic.title === "Diccionario Kamëntsá"
        );

        if (dictionaryTopic) {
          const vocabItems = entries.map((entry: any) => {
            const significado =
              entry.significados?.[0] || entry.equivalentes?.[0] || {};
            const definicion = significado.definicion || "";
            const ejemplo = significado.ejemplo || "";
            return vocabularyRepository.create({
              word: entry.entrada,
              translation: definicion,
              description: ejemplo, // Usar description para el ejemplo si es necesario
              example: ejemplo,
              audioUrl: "",
              imageUrl: "",
              topic: dictionaryTopic,
            });
          });
          // Considerar insertar en lotes grandes para rendimiento
          await vocabularyRepository.save(vocabItems);
          console.log(
            "Diccionario Kamëntsá importado correctamente con",
            vocabItems.length,
            "palabras."
          );
        } else {
          console.warn(
            'Tema "Diccionario Kamëntsá" no encontrado, omitiendo importación del diccionario.'
          );
        }
      } catch (error) {
        console.error("Error al parsear o importar el diccionario:", error);
    }
  }

  private async seedContent() {
    console.log('Seeding Content (placeholder)...');
    // Content seeding is partially handled in processContentData based on JSON files.
    // Review if additional content seeding is needed here, perhaps for content not covered by the JSON structure.
    // This will require fetching existing Lessons or Topics
    // Example: Create content
    // const lesson = await this.lessonRepository.findOne({ where: { title: 'Lesson 1.1: Greetings' } }); // Example lesson
    // if (lesson) {
    //   const contentData = { type: 'text', content: 'Hello in Kamentsa is aiñe.', lesson: lesson }; // Usar 'content' en lugar de 'value'
    //   // Need to determine how to uniquely identify content to avoid duplicates
    //   // const existing = await this.contentRepository.findOne({ where: { lesson: lesson, type: contentData.type, content: contentData.content } }); // Usar 'content'
    //   // if (!existing) {
    //   //   await this.contentRepository.save(this.contentRepository.create(contentData));
    //   // }
    // }
    // This will likely require data from the content files themselves
  }

  private async seedCulturalContent() {
    console.log('Seeding Cultural Content...');
    const culturalContentRepository = this.culturalContentRepository; // Usar el repositorio inyectado

    // Lógica de seeding de contenido cultural adaptada de seed.ts
    const culturalContentsData = [
      {
        title: "Mito de Origen",
        description: "La historia de la creación según el pueblo Kamëntsá",
        content: "Había una vez...",
        category: "mitos",
        mediaUrls: ["http://example.com/video/mito.mp4"],
      },
      {
        title: "Danza Tradicional",
        description: "Descripción de una danza importante",
        content: "La danza se realiza...",
        category: "danzas",
        mediaUrls: [
          "http://example.com/audio/danza.mp3",
          "http://example.com/images/danza.jpg",
        ],
      },
      {
        title: "Receta Tradicional",
        description: "Cómo preparar un plato típico",
        content: "Ingredientes: ... Preparación: ...",
        category: "gastronomia",
        mediaUrls: [], // Añadir campo mediaUrls si existe en la entidad
      },
    ];

    for (const culturalContentData of culturalContentsData) {
      const existingCulturalContent = await culturalContentRepository.findOne({
        where: { title: culturalContentData.title },
      });

      if (!existingCulturalContent) {
        const culturalContent = culturalContentRepository.create(culturalContentData);
        await culturalContentRepository.save(culturalContent);
        console.log(`Cultural Content "${culturalContent.title}" created.`);
      } else {
        console.log(`Cultural Content "${existingCulturalContent.title}" already exists.`);
      }
    }
  }
}
