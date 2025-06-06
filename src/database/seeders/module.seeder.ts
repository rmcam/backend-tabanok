import { DataSourceAwareSeed } from './data-source-aware-seed';
import { DataSource } from 'typeorm';
import { Module } from '../../features/module/entities/module.entity';

interface DictionarySection {
  type?: string; // Add type property if it exists in your JSON structure
  content?: any;
  metadata?: { title?: string; description?: string }; // Add metadata property
  titulo?: string; // Add titulo property
  descripcion?: string; // Add descripcion property
  generalidades?: { titulo?: string; alfabeto?: { descripcion?: string } }; // For Generalidades
  introduccion?: { titulo?: string; descripcion?: string }; // For Introduccion
}

export class ModuleSeeder extends DataSourceAwareSeed {
  constructor(dataSource: DataSource) {
    super(dataSource);
  }

  async run(): Promise<void> {
    try {
      console.log('[ModuleSeeder] Running run() method.');
      const moduleRepository = this.dataSource.getRepository(Module);

      const consolidatedDictionary = require('../files/json/consolidated_dictionary.json');

      const excludedSections = ['ApiRoutes', 'ErrorResponses', 'Metadata', 'SearchConfig'];

      const modulesToSeed = Object.entries(consolidatedDictionary.sections)
        .filter(([name]) => !excludedSections.includes(name))
        .map(([name, section]: [string, DictionarySection]) => {
          let description = 'Sin descripción';
          let moduleName = name.charAt(0).toUpperCase() + name.slice(1); // Capitalize first letter

        // Try to get a more specific description based on the section content
        if (section.metadata?.description) {
          description = section.metadata.description;
        } else if (section.descripcion) {
          description = section.descripcion;
        } else if (section.titulo) {
          description = `Información sobre ${section.titulo.toLowerCase()}`;
        } else if (section.content) {
          if (section.content.descripcion) {
            description = section.content.descripcion;
          } else if (section.content.titulo) {
            description = `Información sobre ${section.content.titulo.toLowerCase()}`;
          } else if (section.content.generalidades?.alfabeto?.descripcion) {
            description = section.content.generalidades.alfabeto.descripcion;
          } else if (section.content.introduccion?.descripcion) {
            description = section.content.introduccion.descripcion;
          }
        }

        // Specific descriptions for known sections
        if (name === 'ApiRoutes') {
          moduleName = 'Rutas de API';
          description = 'Documentación de las rutas (endpoints) de la API del backend Tabanok.';
        } else if (name === 'ErrorResponses') {
          moduleName = 'Respuestas de Error';
          description = 'Respuestas de error estandarizadas de la API del backend Tabanok.';
        } else if (name === 'Metadata') {
          moduleName = 'Metadatos del Diccionario';
          description = 'Información de metadatos y configuración del diccionario bilingüe Kamëntsá-Español.';
        } else if (name === 'SearchConfig') {
          moduleName = 'Configuración de Búsqueda';
          description = 'Configuración para el motor de búsqueda del diccionario Kamëntsá.';
        } else if (name === 'Introduccion') {
          moduleName = 'Introducción al Idioma';
          description = section.content?.introduccion?.descripcion || 'Introducción general al idioma Kamëntsá.';
        } else if (name === 'Generalidades') {
          moduleName = 'Generalidades del Idioma';
          description = section.content?.generalidades?.titulo || 'Aspectos fundamentales del idioma Kamëntsá.';
        } else if (name === 'Fonetica') {
          moduleName = 'Fonética y Pronunciación';
          description = 'Estudio de los sonidos, alfabeto, articulación y variaciones dialectales del Kamëntsá.';
        } else if (name === 'Gramatica') {
          moduleName = 'Gramática Fundamental';
          description = 'Conceptos fundamentales de la gramática Kamëntsá, incluyendo sustantivos, verbos y pronombres.';
        } else if (name === 'Diccionario') {
          moduleName = 'Diccionario Bilingüe';
          description = section.content?.descripcion || 'Diccionario bilingüe Kamëntsá-Español y Español-Kamëntsá.';
        } else if (name === 'Recursos') {
          moduleName = 'Recursos Adicionales';
          description = section.content?.descripcion || 'Recursos complementarios para el aprendizaje del idioma y la cultura Kamëntsá.';
        } else if (name === 'ClasificadoresNominales') {
          moduleName = 'Clasificadores Nominales';
          description = section.descripcion || 'Sufijos esenciales que se añaden a los sustantivos para especificar características.';
        } else if (name === 'Alfabeto') {
          moduleName = 'El Alfabeto Kamëntsá';
          description = section.content?.descripcion || 'El alfabeto Kamëntsá y su estructura.';
        } else if (name === 'ArticulacionDetallada') {
          moduleName = 'Articulación Detallada';
          description = section.content?.descripcion || 'Descripción fonética detallada de sonidos específicos en Kamëntsá.';
        } else if (name === 'CombinacionesSonoras') {
          moduleName = 'Combinaciones Sonoras';
          description = section.content?.descripcion || 'Grupos consonánticos y reglas de unión en Kamëntsá.';
        } else if (name === 'Consonantes') {
          moduleName = 'Las Consonantes Kamëntsá';
          description = section.content?.descripcion || 'El sistema consonántico del Kamëntsá.';
        } else if (name === 'Numero') {
          moduleName = 'Número en Sustantivos';
          description = section.content?.descripcion || 'Distinción de número en los sustantivos Kamëntsá.';
        } else if (name === 'PatronesAcentuacion') {
          moduleName = 'Patrones de Acentuación';
          description = section.content?.descripcion || 'Claves para el ritmo y la acentuación en el idioma Kamëntsá.';
        } else if (name === 'Pronombres') {
          moduleName = 'Pronombres Personales';
          description = section.content?.descripcion || 'Pronombres personales en Kamëntsá y su uso.';
        } else if (name === 'Pronunciacion') {
          moduleName = 'Guía de Pronunciación';
          description = section.content?.descripcion || 'Guía para la correcta articulación de los sonidos en Kamëntsá.';
        } else if (name === 'Sustantivos') {
          moduleName = 'Sustantivos Kamëntsá';
          description = section.content?.descripcion || 'Estructura y clasificadores de los sustantivos en Kamëntsá.';
        } else if (name === 'VariacionesDialectales') {
          moduleName = 'Variaciones Dialectales';
          description = section.content?.descripcion || 'Diferencias de pronunciación y uso según la región en Kamëntsá.';
        } else if (name === 'Verbos') {
          moduleName = 'Verbos Kamëntsá';
          description = section.content?.descripcion || 'Clasificación y conjugación de los verbos en Kamëntsá.';
        } else if (name === 'Vocales') {
          moduleName = 'Las Vocales Kamëntsá';
          description = section.content?.descripcion || 'El sistema vocálico del Kamëntsá.';
        }


        return {
          name: moduleName,
          description: description,
        };
      });

      const modulesToSave = modulesToSeed.filter(m => m.name && m.description); // Filter out any empty modules

      // Usar upsert para asegurar que todos los módulos existen o se actualizan
      console.log(`[ModuleSeeder] Seeding ${modulesToSave.length} modules...`);
      console.log(`[ModuleSeeder] Attempting to upsert modules...`);
      await moduleRepository.upsert(
        modulesToSave,
        {
          conflictPaths: ["name"], // Conflict based on the 'name' column
          skipUpdateIfNoValuesChanged: true,
        }
      );
      console.log("[ModuleSeeder] Upsert completed.");
      console.log("[ModuleSeeder] Modules seeded successfully.");
    } catch (error) {
      console.error('[ModuleSeeder] Error seeding modules:', error);
      console.error('[ModuleSeeder] Error details:', error.message, error.stack);
    }
  }
}
