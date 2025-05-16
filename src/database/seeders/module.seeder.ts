import { v4 as uuidv4 } from 'uuid';
import { DataSourceAwareSeed } from './data-source-aware-seed';
import { DataSource } from 'typeorm';
import { Module } from '../../features/module/entities/module.entity';

export class ModuleSeeder extends DataSourceAwareSeed {
  constructor(dataSource: DataSource) {
    super(dataSource);
  }

  async run(): Promise<void> {
    try {
      console.log('[ModuleSeeder] Running run() method.');
      const moduleRepository = this.dataSource.getRepository(Module);

      const modulesData = [
        { name: 'Introducción al Kamëntsá', description: 'Conceptos básicos del idioma.' },
        { name: 'Fonética y Pronunciación', description: 'Sonidos y reglas de pronunciación.' },
        { name: 'Gramática Fundamental', description: 'Estructura básica de las oraciones.' },
        { name: 'Vocabulario Esencial', description: 'Palabras y frases comunes.' },
        { name: 'Cultura y Tradiciones', description: 'Aspectos importantes de la cultura Kamëntsá.' },
        { name: 'Conversación Cotidiana', description: 'Practica diálogos y expresiones comunes para el día a día.' },
        { name: 'Lectura y Escritura', description: 'Aprende los principios básicos para leer y escribir en Kamëntsá.' },
        { name: 'Expresiones Idiomáticas', description: 'Explora frases y expresiones con significados no literales.' },
        { name: 'Historia del Pueblo Kamëntsá', description: 'Conoce la historia y el legado cultural del pueblo Kamëntsá.' },
      ];

      const modulesToSeed = modulesData.map(moduleData => ({
        id: uuidv4(), // Asignar un UUID único a cada módulo
        ...moduleData,
      }));

      // Usar upsert para asegurar que todos los módulos existen o se actualizan
      console.log(`[ModuleSeeder] Seeding ${modulesToSeed.length} modules...`);
      console.log(`[ModuleSeeder] Attempting to upsert modules...`);
      await moduleRepository.upsert(
        modulesToSeed,
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
