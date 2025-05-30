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

        const unityMap: { [key: string]: string } = {
            'verbos': 'Tiempos Verbales Básicos',
            'saludos': 'Saludos y Presentaciones',
            'familia': 'Familia y Comunidad',
            'comida': 'Comida y Naturaleza',
            'colores': 'Colores y Formas',
            'numeros': 'Números y Cantidades',
            'animales': 'Animales y Plantas Nativas',
            'cuerpo_humano': 'El Cuerpo Humano',
            'preguntas': 'Conversación Cotidiana', // Mapeo existente
            'sentimientos': 'Expresión de Sentimientos',
            'musica': 'La Música Kamëntsá',
            'artesania': 'Artesanía y Vestimenta',
            'historia': 'Historia del Pueblo Kamëntsá',
            // Nuevos mapeos basados en los títulos de las unidades en UnitySeeder
            'alfabeto': 'Bienvenida y Alfabeto',
            'fonetica': 'Fonética y Pronunciación',
            'oracion': 'Estructura de la Oración',
            'vida_diaria': 'Aspectos de la Vida Diaria',
            'lectura': 'Conceptos de Lectura',
            'escritura': 'Práctica de Escritura',
            'frases': 'Frases Comunes',
            'modismos': 'Modismos Kamëntsá',
            'eventos_historicos': 'Eventos Históricos Clave',
            'figuras_historicas': 'Figuras Históricas',
            'introduccion': 'Introducción al Kamëntsá',
            'gramatica': 'Gramática Fundamental',
            'vocabulario_general': 'Vocabulario General',
            'diccionario': 'Contenido del Diccionario',
        };

        let unityTitle = 'Contenido del Diccionario'; // Asociar a una unidad por defecto

        // Buscar el mapeo más específico primero
        let foundMapping = false;
        for (const key in unityMap) {
            if (sectionName.includes(key)) {
                unityTitle = unityMap[key];
                foundMapping = true;
                break;
            }
        }
        // Si no se encontró un mapeo específico, intentar un mapeo más general
        if (!foundMapping) {
            const normalizedSectionName = sectionName.replace(/_/g, ' ').toLowerCase();
            for (const unityData of unities) {
                if (unityData.title.toLowerCase().includes(normalizedSectionName)) {
                    unityTitle = unityData.title;
                    break;
                }
            }
        }


        const unityId = unityTitleToIdMap.get(unityTitle); // Obtener el ID de la unidad

        return {
          title: sectionName.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()), // Formatear nombre de sección como título
          description: description,
          unityTitle: unityTitle, // Mantener para logging si es necesario
          unityId: unityId, // Incluir el ID de la unidad
        };
      });

    // Add specific lessons required by ExerciseSeeder and other relevant lessons
    // Asegurarse de que estas lecciones también usen unityId
    lessonsToSeed.push(
        { title: 'Verbos Irregulares', description: 'Lección sobre los verbos irregulares en Kamëntsá.', unityTitle: 'Tiempos Verbales Básicos', unityId: unityTitleToIdMap.get('Tiempos Verbales Básicos') },
        { title: 'Cuentos Tradicionales', description: 'Lección sobre cuentos y narraciones tradicionales en Kamëntsá.', unityTitle: 'Vocabulario General', unityId: unityTitleToIdMap.get('Vocabulario General') },
        { title: 'Gramática Avanzada', description: 'Lección sobre estructuras gramaticales más complejas.', unityTitle: 'Vocabulario General', unityId: unityTitleToIdMap.get('Vocabulario General') },
        { title: 'Fonemas Especiales', description: 'Lección sobre sonidos y fonemas particulares del Kamëntsá.', unityTitle: 'Vocales y Consonantes', unityId: unityTitleToIdMap.get('Vocales y Consonantes') },
        { title: 'Expresiones de Tiempo', description: 'Lección sobre cómo expresar el tiempo en Kamëntsá.', unityTitle: 'Aspectos de la Vida Diaria', unityId: unityTitleToIdMap.get('Aspectos de la Vida Diaria') },
        { title: 'Direcciones y Lugares', description: 'Lección sobre cómo pedir y dar direcciones y nombres de lugares.', unityTitle: 'Aspectos de la Vida Diaria', unityId: unityTitleToIdMap.get('Aspectos de la Vida Diaria') },
        { title: 'Festividades', description: 'Lección sobre las principales festividades del pueblo Kamëntsá.', unityTitle: 'Vocabulario General', unityId: unityTitleToIdMap.get('Vocabulario General') },
        { title: 'Biografías', description: 'Lección sobre personajes importantes en la historia Kamëntsá.', unityTitle: 'Historia del Pueblo Kamëntsá', unityId: unityTitleToIdMap.get('Historia del Pueblo Kamëntsá') },
        // Añadir lecciones genéricas para unidades que podrían no tener mapeo directo del diccionario
        { title: 'Lección Introductoria', description: 'Lección general para la unidad de Bienvenida y Alfabeto.', unityTitle: 'Bienvenida y Alfabeto', unityId: unityTitleToIdMap.get('Bienvenida y Alfabeto') },
        { title: 'Conceptos Básicos de Oración', description: 'Lección sobre la estructura básica de la oración.', unityTitle: 'Estructura de la Oración', unityId: unityTitleToIdMap.get('Estructura de la Oración') },
        { title: 'Práctica de Conversación', description: 'Lección para practicar la conversación diaria.', unityTitle: 'Conversación Cotidiana', unityId: unityTitleToIdMap.get('Conversación Cotidiana') },
        { title: 'Introducción a la Lectura', description: 'Lección para iniciar la lectura en Kamëntsá.', unityTitle: 'Conceptos de Lectura', unityId: unityTitleToIdMap.get('Conceptos de Lectura') },
        { title: 'Ejercicios de Escritura', description: 'Lección con ejercicios prácticos de escritura.', unityTitle: 'Práctica de Escritura', unityId: unityTitleToIdMap.get('Práctica de Escritura') },
        { title: 'Explorando Frases Comunes', description: 'Lección sobre el uso de frases comunes.', unityTitle: 'Frases Comunes', unityId: unityTitleToIdMap.get('Frases Comunes') },
        { title: 'Entendiendo Modismos', description: 'Lección para comprender los modismos Kamëntsá.', unityTitle: 'Modismos Kamëntsá', unityId: unityTitleToIdMap.get('Modismos Kamëntsá') },
        { title: 'Hitos Históricos', description: 'Lección sobre eventos históricos clave del pueblo Kamëntsá.', unityTitle: 'Eventos Históricos Clave', unityId: unityTitleToIdMap.get('Eventos Históricos Clave') },
        { title: 'Grandes Figuras Kamëntsá', description: 'Lección sobre personajes importantes en la historia Kamëntsá.', unityTitle: 'Figuras Históricas', unityId: unityTitleToIdMap.get('Figuras Históricas') },
        { title: 'Introducción al Idioma', description: 'Lección introductoria al idioma Kamëntsá.', unityTitle: 'Introducción al Kamëntsá', unityId: unityTitleToIdMap.get('Introducción al Kamëntsá') },
        { title: 'Fundamentos de Gramática', description: 'Lección sobre los fundamentos de la gramática Kamëntsá.', unityTitle: 'Gramática Fundamental', unityId: unityTitleToIdMap.get('Gramática Fundamental') },
    );


    for (const lessonData of lessonsToSeed) {
      const existingLesson = await lessonRepository.findOne({ where: { title: lessonData.title } });

      if (!existingLesson) {
        // Usar unityId para buscar la unidad
        const unity = lessonData.unityId ? await unityRepository.findOne({ where: { id: lessonData.unityId } }) : null;
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
          console.log(`Unity with title "${lessonData.unityTitle}" (ID: ${lessonData.unityId}) not found for Lesson "${lessonData.title}". Skipping.`);
        }
      } else {
        console.log(`Lesson "${lessonData.title}" already exists. Skipping.`);
      }
    }
  }
}
