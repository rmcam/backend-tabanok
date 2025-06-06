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

    // Crear un mapa de unidades para búsqueda rápida por título
    const unityMap = new Map<string, Unity>();
    unities.forEach(unity => unityMap.set(unity.title, unity));

    const dictionaryPath = path.resolve(
      __dirname,
      '../files/json/consolidated_dictionary.json',
    );
    const dictionaryContent = JSON.parse(
      fs.readFileSync(dictionaryPath, 'utf-8'),
    );

    const sections = dictionaryContent.sections;
    const lessonsToSeed: { title: string; description: string; unityTitle: string; }[] = [];

    // Mapeo de secciones del diccionario a títulos de unidades
    const sectionToUnityMap: { [key: string]: string } = {
      Introduccion: 'Introducción al Kamëntsá',
      Generalidades: 'Introducción al Kamëntsá',
      Fonetica: 'Vocales y Consonantes',
      Gramatica: 'Gramática Fundamental',
      Diccionario: 'Vocabulario General',
      Recursos: 'Contenido del Diccionario',
      Alfabeto: 'Vocales y Consonantes',
      ArticulacionDetallada: 'Vocales y Consonantes',
      CombinacionesSonoras: 'Vocales y Consonantes',
      Consonantes: 'Vocales y Consonantes',
      Numero: 'Gramática Fundamental',
      PatronesAcentuacion: 'Vocales y Consonantes',
      Pronombres: 'Gramática Fundamental',
      Pronunciacion: 'Vocales y Consonantes',
      Sustantivos: 'Gramática Fundamental',
      VariacionesDialectales: 'Vocales y Consonantes',
      Verbos: 'Gramática Fundamental',
      Vocales: 'Vocales y Consonantes',
      ClasificadoresNominales: 'Gramática Fundamental',
    };

    for (const sectionName in sections) {
      // Excluir secciones de configuración/metadata que no son lecciones directas
      if (['ApiRoutes', 'ErrorResponses', 'Metadata', 'SearchConfig'].includes(sectionName)) {
        continue;
      }

      const sectionData = sections[sectionName];
      let description = `Contenido sobre ${sectionName.replace(/_/g, ' ').toLowerCase()}`;
      let title = sectionName.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()); // Formatear nombre de sección como título

      // Intentar obtener una descripción más detallada si está disponible
      if (sectionData.metadata?.description) {
          description = sectionData.metadata.description;
      } else if (sectionData.descripcion) {
          description = sectionData.descripcion;
      } else if (sectionData.titulo) {
          description = sectionData.titulo;
      } else if (sectionData.content) {
          if (sectionData.content.descripcion) {
              description = sectionData.content.descripcion;
          } else if (sectionData.content.titulo) {
              description = sectionData.content.titulo;
          } else if (sectionData.content.generalidades?.alfabeto?.descripcion) {
              description = sectionData.content.generalidades.alfabeto.descripcion;
          } else if (sectionData.content.introduccion?.descripcion) {
              description = sectionData.content.introduccion.descripcion;
          }
      }

      // Ajustar el título para algunas secciones si es necesario
      if (sectionName === 'Introduccion') {
        title = 'Introducción al Idioma Kamëntsá';
      } else if (sectionName === 'Generalidades') {
        title = 'Generalidades del Idioma';
      } else if (sectionName === 'Fonetica') {
        title = 'Fonética y Pronunciación General';
      } else if (sectionName === 'Gramatica') {
        title = 'Gramática General';
      } else if (sectionName === 'Diccionario') {
        title = 'Diccionario Bilingüe Kamëntsá';
      } else if (sectionName === 'Recursos') {
        title = 'Recursos Adicionales para el Aprendizaje';
      } else if (sectionName === 'ClasificadoresNominales') {
        title = 'Clasificadores Nominales en Kamëntsá';
      } else if (sectionName === 'Alfabeto') {
        title = 'El Alfabeto Kamëntsá';
      } else if (sectionName === 'ArticulacionDetallada') {
        title = 'Articulación Detallada de Sonidos';
      } else if (sectionName === 'CombinacionesSonoras') {
        title = 'Combinaciones Sonoras en Kamëntsá';
      } else if (sectionName === 'Consonantes') {
        title = 'Las Consonantes del Kamëntsá';
      } else if (sectionName === 'Numero') {
        title = 'El Número en Sustantivos Kamëntsá';
      } else if (sectionName === 'PatronesAcentuacion') {
        title = 'Patrones de Acentuación en Kamëntsá';
      } else if (sectionName === 'Pronombres') {
        title = 'Los Pronombres en Kamëntsá';
      } else if (sectionName === 'Pronunciacion') {
        title = 'Guía de Pronunciación del Kamëntsá';
      } else if (sectionName === 'Sustantivos') {
        title = 'Los Sustantivos en Kamëntsá';
      } else if (sectionName === 'VariacionesDialectales') {
        title = 'Variaciones Dialectales del Kamëntsá';
      } else if (sectionName === 'Verbos') {
        title = 'Los Verbos en Kamëntsá';
      } else if (sectionName === 'Vocales') {
        title = 'Las Vocales del Kamëntsá';
      }


      const unityTitle = sectionToUnityMap[sectionName];

      if (unityTitle) {
        lessonsToSeed.push({
          title: title,
          description: description,
          unityTitle: unityTitle,
        });
      } else {
        console.warn(`No unity mapping found for section "${sectionName}". Skipping lesson creation for this section.`);
      }
    }

    // Add specific lessons required by ExerciseSeeder and other relevant lessons
    // Ensure these also map to existing unity titles
    lessonsToSeed.push(
        { title: 'Verbos Irregulares', description: 'Lección sobre los verbos irregulares en Kamëntsá.', unityTitle: 'Gramática Fundamental' },
        { title: 'Cuentos Tradicionales', description: 'Lección sobre cuentos y narraciones tradicionales en Kamëntsá.', unityTitle: 'Contenido del Diccionario' },
        { title: 'Gramática Avanzada', description: 'Lección sobre estructuras gramaticales más complejas.', unityTitle: 'Gramática Fundamental' },
        { title: 'Fonemas Especiales', description: 'Lección sobre sonidos y fonemas particulares del Kamëntsá.', unityTitle: 'Vocales y Consonantes' },
        { title: 'Expresiones de Tiempo', description: 'Lección sobre cómo expresar el tiempo en Kamëntsá.', unityTitle: 'Gramática Fundamental' },
        { title: 'Direcciones y Lugares', description: 'Lección sobre cómo pedir y dar direcciones y nombres de lugares.', unityTitle: 'Vocabulario General' },
        { title: 'Festividades Kamëntsá', description: 'Lección sobre las principales festividades del pueblo Kamëntsá.', unityTitle: 'Contenido del Diccionario' },
        { title: 'Biografías Importantes', description: 'Lección sobre personajes importantes en la historia Kamëntsá.', unityTitle: 'Contenido del Diccionario' },
        { title: 'Saludos y Despedidas', description: 'Lección sobre saludos y despedidas en Kamëntsá.', unityTitle: 'Vocabulario General' },
        { title: 'La Familia Kamëntsá', description: 'Lección sobre los términos de parentesco en Kamëntsá.', unityTitle: 'Vocabulario General' },
        { title: 'Comida Tradicional', description: 'Lección sobre la comida tradicional Kamëntsá.', unityTitle: 'Vocabulario General' },
        { title: 'Colores en Kamëntsá', description: 'Lección sobre los colores en el idioma Kamëntsá.', unityTitle: 'Vocabulario General' },
        { title: 'Números en Kamëntsá', description: 'Lección sobre los números en el idioma Kamëntsá.', unityTitle: 'Vocabulario General' },
        { title: 'Animales Nativos', description: 'Lección sobre animales nativos de la región.', unityTitle: 'Vocabulario General' },
        { title: 'Partes del Cuerpo', description: 'Lección sobre las partes del cuerpo humano en Kamëntsá.', unityTitle: 'Vocabulario General' },
        { title: 'Preguntas Comunes', description: 'Lección sobre cómo formular y responder preguntas comunes.', unityTitle: 'Gramática Fundamental' },
        { title: 'Expresión de Sentimientos', description: 'Lección sobre cómo expresar emociones y sentimientos en Kamëntsá.', unityTitle: 'Vocabulario General' },
        { title: 'Música Tradicional Kamëntsá', description: 'Lección sobre la música y los instrumentos tradicionales Kamëntsá.', unityTitle: 'Contenido del Diccionario' },
        { title: 'Artesanía Kamëntsá', description: 'Lección sobre las técnicas y significados de la artesanía Kamëntsá.', unityTitle: 'Contenido del Diccionario' },
        { title: 'Rituales y Ceremonias Kamëntsá', description: 'Lección sobre los rituales y ceremonias importantes del pueblo Kamëntsá.', unityTitle: 'Contenido del Diccionario' },
        { title: 'Medicina Tradicional Kamëntsá', description: 'Lección sobre las plantas medicinales y prácticas curativas tradicionales.', unityTitle: 'Contenido del Diccionario' },
    );


    for (const lessonData of lessonsToSeed) {
      const existingLesson = await lessonRepository.findOne({ where: { title: lessonData.title } });

      if (!existingLesson) {
        const unity = unityMap.get(lessonData.unityTitle);
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
          console.warn(`Unity "${lessonData.unityTitle}" not found for Lesson "${lessonData.title}". Skipping.`);
        }
      } else {
        console.log(`Lesson "${lessonData.title}" already exists. Skipping.`);
      }
    }
  }
}
