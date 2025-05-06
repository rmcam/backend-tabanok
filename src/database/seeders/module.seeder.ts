import { DataSourceAwareSeed } from './index';
import { DataSource } from 'typeorm';
import { Module } from '../../features/module/entities/module.entity';

export class ModuleSeeder extends DataSourceAwareSeed {
  constructor(dataSource: DataSource) {
    super(dataSource);
  }

  async run(): Promise<void> {
    const moduleRepository = this.dataSource.getRepository(Module);

    const modulesToSeed = [
      { name: 'Introducción al Kamëntsá', description: 'Conceptos básicos del idioma.' },
      { name: 'Fonética y Pronunciación', description: 'Sonidos y reglas de pronunciación.' },
      { name: 'Gramática Fundamental', description: 'Estructura básica de las oraciones.' },
      { name: 'Vocabulario Esencial', description: 'Palabras y frases comunes.' },
      { name: 'Cultura y Tradiciones', description: 'Aspectos importantes de la cultura Kamëntsá.' },
      { name: 'Conversación Cotidiana', description: 'Diálogos y expresiones de uso diario.' },
      { name: 'Lectura y Escritura', description: 'Principios básicos de lectoescritura.' },
    ];

    for (const moduleData of modulesToSeed) {
      const existingModule = await moduleRepository.findOne({ where: { name: moduleData.name } });

      if (!existingModule) {
        const newModule = moduleRepository.create(moduleData);
        await moduleRepository.save(newModule);
        console.log(`Module "${moduleData.name}" seeded.`);
      } else {
        console.log(`Module "${moduleData.name}" already exists. Skipping.`);
      }
    }
  }
}
