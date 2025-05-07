import * as fs from 'fs';
import * as path from 'path';
import { DataSourceAwareSeed } from './index';
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

    const dictionaryPath = path.resolve(
      __dirname,
      '../files/json/consolidated_dictionary.json',
    );
    const dictionaryContent = JSON.parse(
      fs.readFileSync(dictionaryPath, 'utf-8'),
    );

    const sections = dictionaryContent.sections;
    const lessonsToSeed = Object.keys(sections)
      .filter(sectionName => sectionName !== 'metadata' && sectionName !== 'search_config' && sectionName !== 'api_routes' && sectionName !== 'error_responses') // Excluir secciones de configuración/metadata
      .map(sectionName => {
        let description = `Contenido sobre ${sectionName}`;
        // Intentar obtener una descripción más detallada si está disponible
        if (sections[sectionName].content && sections[sectionName].content.descripcion) {
            description = sections[sectionName].content.descripcion;
        } else if (sections[sectionName].content && Array.isArray(sections[sectionName].content) && sections[sectionName].content.length > 0 && sections[sectionName].content[0].descripcion) {
             description = sections[sectionName].content[0].descripcion;
        }


        let unityTitle = 'Contenido del Diccionario'; // Asociar a una unidad por defecto

        // Mejorar la asociación de lecciones a unidades
        if (sectionName.includes('verbos')) {
            unityTitle = 'Tiempos Verbales Básicos';
        } else if (sectionName.includes('saludos')) {
            unityTitle = 'Saludos y Presentaciones';
        } else if (sectionName.includes('familia')) {
            unityTitle = 'Familia y Comunidad';
        } else if (sectionName.includes('comida')) {
            unityTitle = 'Comida y Naturaleza';
        } else if (sectionName.includes('colores')) {
            unityTitle = 'Colores y Formas';
        } else if (sectionName.includes('numeros')) {
            unityTitle = 'Números y Cantidades';
        } else if (sectionName.includes('animales')) {
            unityTitle = 'Animales y Plantas Nativas';
        } else if (sectionName.includes('cuerpo_humano')) {
            unityTitle = 'El Cuerpo Humano';
        } else if (sectionName.includes('preguntas')) {
            unityTitle = 'Preguntas y Respuestas';
        } else if (sectionName.includes('sentimientos')) {
            unityTitle = 'Expresión de Sentimientos';
        } else if (sectionName.includes('musica')) {
            unityTitle = 'La Música Kamëntsá';
        } else if (sectionName.includes('artesania')) {
            unityTitle = 'Artesanía y Vestimenta';
        } else if (sectionName.includes('historia')) {
            unityTitle = 'Historia del Pueblo Kamëntsá';
        }


        return {
          title: sectionName.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()), // Formatear nombre de sección como título
          description: description,
          unityTitle: unityTitle,
        };
      });

    // Add specific lessons required by ExerciseSeeder and other relevant lessons
    lessonsToSeed.push(
        { title: 'Verbos Irregulares', description: 'Lección sobre los verbos irregulares en Kamëntsá.', unityTitle: 'Tiempos Verbales Básicos' },
        { title: 'Cuentos Tradicionales', description: 'Lección sobre cuentos y narraciones tradicionales en Kamëntsá.', unityTitle: 'Textos Sencillos' },
        { title: 'Gramática Avanzada', description: 'Lección sobre estructuras gramaticales más complejas.', unityTitle: 'Sintaxis Avanzada' },
        { title: 'Fonemas Especiales', description: 'Lección sobre sonidos y fonemas particulares del Kamëntsá.', unityTitle: 'Vocales y Consonantes' },
        { title: 'Expresiones de Tiempo', description: 'Lección sobre cómo expresar el tiempo en Kamëntsá.', unityTitle: 'Aspectos de la Vida Diaria' },
        { title: 'Direcciones y Lugares', description: 'Lección sobre cómo pedir y dar direcciones y nombres de lugares.', unityTitle: 'Aspectos de la Vida Diaria' },
        { title: 'Festividades', description: 'Lección sobre las principales festividades del pueblo Kamëntsá.', unityTitle: 'Cultura y Tradiciones' },
        { title: 'Biografías', description: 'Lección sobre personajes importantes en la historia Kamëntsá.', unityTitle: 'Historia del Pueblo Kamëntsá' },
    );


    for (const lessonData of lessonsToSeed) {
      const existingLesson = await lessonRepository.findOne({ where: { title: lessonData.title } });

      if (!existingLesson) {
        const unity = unities.find(u => u.title === lessonData.unityTitle);
        if (unity) {
          const newLesson = lessonRepository.create({
            title: lessonData.title,
            description: lessonData.description,
            unity: unity,
            unityId: unity.id,
          });
          await lessonRepository.save(newLesson);
          console.log(`Lesson "${lessonData.title}" seeded.`);
        } else {
          console.log(`Unity "${lessonData.unityTitle}" not found for Lesson "${lessonData.title}". Skipping.`);
        }
      } else {
        console.log(`Lesson "${lessonData.title}" already exists. Skipping.`);
      }
    }
  }
}
