import * as fs from 'fs';
import * as path from 'path';
import { DataSourceAwareSeed } from './data-source-aware-seed'; 
import { DataSource } from 'typeorm';
import { Lesson } from '../../features/lesson/entities/lesson.entity';
import { Unity } from '../../features/unity/entities/unity.entity'; // Revertir a Unity

export class LessonSeeder extends DataSourceAwareSeed {
  constructor(dataSource: DataSource) {
    super(dataSource);
  }

  async run(): Promise<void> {
    const lessonRepository = this.dataSource.getRepository(Lesson);
    const unityRepository = this.dataSource.getRepository(Unity); // Revertir a Unity

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
    const lessonsToSeed: { title: string; description: string; unityTitle: string; }[] = []; // Revertir a unityTitle

    // Mapeo de secciones del diccionario a títulos de unidades correctos
    const sectionToUnityMap: { [key: string]: string } = {
      Introduccion: 'Fundamentos del Kamëntsá',
      Generalidades: 'Fundamentos del Kamëntsá',
      Fonetica: 'Los Sonidos del Kamëntsá',
      Gramatica: 'La Estructura de las Palabras',
      Diccionario: 'Construyendo tu Vocabulario',
      Recursos: 'Herramientas para tu Aprendizaje',
      Alfabeto: 'Los Sonidos del Kamëntsá',
      ArticulacionDetallada: 'Los Sonidos del Kamëntsá',
      CombinacionesSonoras: 'Los Sonidos del Kamëntsá',
      Consonantes: 'Los Sonidos del Kamëntsá',
      Numero: 'La Estructura de las Palabras',
      PatronesAcentuacion: 'Los Sonidos del Kamëntsá',
      Pronombres: 'La Estructura de las Palabras',
      Pronunciacion: 'Los Sonidos del Kamëntsá',
      Sustantivos: 'La Estructura de las Palabras',
      VariacionesDialectales: 'Los Sonidos del Kamëntsá',
      Verbos: 'La Estructura de las Palabras',
      Vocales: 'Los Sonidos del Kamëntsá',
      ClasificadoresNominales: 'La Estructura de las Palabras',
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
      { title: 'Cuentos Tradicionales', description: 'Lección sobre cuentos y narraciones tradicionales en Kamëntsá.', unityTitle: 'Inmersión Cultural' },
      { title: 'Gramática Avanzada', description: 'Lección sobre estructuras gramaticales más complejas.', unityTitle: 'La Estructura de las Palabras' },
      { title: 'Fonemas Especiales', description: 'Lección sobre sonidos y fonemas particulares del Kamëntsá.', unityTitle: 'Los Sonidos del Kamëntsá' },
      { title: 'Saludos y Despedidas', description: 'Lección sobre saludos y despedidas en Kamëntsá.', unityTitle: 'Construyendo tu Vocabulario' },
      { title: 'La Familia Kamëntsá', description: 'Lección sobre los términos de parentesco en Kamëntsá.', unityTitle: 'Construyendo tu Vocabulario' },
      { title: 'Comida Tradicional', description: 'Lección sobre la comida tradicional Kamëntsá.', unityTitle: 'Construyendo tu Vocabulario' },
      { title: 'Colores en Kamëntsá', description: 'Lección sobre los colores en el idioma Kamëntsá.', unityTitle: 'Construyendo tu Vocabulario' },
      { title: 'Números en Kamëntsá', description: 'Lección sobre los números en el idioma Kamëntsá.', unityTitle: 'Construyendo tu Vocabulario' },
      { title: 'Animales Nativos', description: 'Lección sobre animales nativos de la región.', unityTitle: 'Construyendo tu Vocabulario' }
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
