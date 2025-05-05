import { DataSourceAwareSeed } from './index';
import { DataSource } from 'typeorm';
import { Unity } from '../../features/unity/entities/unity.entity';
import { Module } from '../../features/module/entities/module.entity';
import { User } from '../../auth/entities/user.entity'; // Importar User

export class UnitySeeder extends DataSourceAwareSeed {
  constructor(dataSource: DataSource) {
    super(dataSource);
  }

  async run(): Promise<void> {
    const unityRepository = this.dataSource.getRepository(Unity);
    const moduleRepository = this.dataSource.getRepository(Module);
    const userRepository = this.dataSource.getRepository(User); // Obtener repositorio de User

    const modules = await moduleRepository.find();
    const adminUser = await userRepository.findOne({ where: { email: 'admin@example.com' } }); // Obtener un usuario (ej. admin)

    if (modules.length === 0) {
      console.log('No modules found. Skipping UnitySeeder.');
      return;
    }

    if (!adminUser) {
        console.log('Admin user not found. Skipping UnitySeeder.');
        return;
    }

    const unitsToSeed = [
      { title: 'Bienvenida y Alfabeto', description: 'Introducción al alfabeto Kamëntsá.', moduleName: 'Introducción al Kamëntsá' },
      { title: 'Saludos y Presentaciones', description: 'Frases básicas para interactuar.', moduleName: 'Introducción al Kamëntsá' },
      { title: 'Vocales y Consonantes', description: 'Estudio detallado de los sonidos.', moduleName: 'Fonética y Pronunciación' },
      { title: 'Acentuación y Entonación', description: 'Reglas de acentuación y patrones de entonación.', moduleName: 'Fonética y Pronunciación' },
      { title: 'Estructura de la Oración', description: 'Orden de las palabras y tipos de oraciones.', moduleName: 'Gramática Fundamental' },
      { title: 'Tiempos Verbales Básicos', description: 'Conjugación de verbos comunes.', moduleName: 'Gramática Fundamental' },
      { title: 'Familia y Comunidad', description: 'Vocabulario relacionado con la familia y la comunidad.', moduleName: 'Vocabulario Esencial' },
      { title: 'Comida y Naturaleza', description: 'Vocabulario sobre alimentos y el entorno natural.', moduleName: 'Vocabulario Esencial' },
    ];

    for (const unitData of unitsToSeed) {
      const existingUnit = await unityRepository.findOne({ where: { title: unitData.title } }); // Buscar por title

      if (!existingUnit) {
        const module = modules.find(m => m.name === unitData.moduleName);
        if (module) {
          const newUnit = unityRepository.create({
            title: unitData.title, // Usar title
            description: unitData.description,
            module: module,
            user: adminUser, // Asignar el usuario
            userId: adminUser.id, // Asignar el userId
          });
          await unityRepository.save(newUnit);
          console.log(`Unity "${unitData.title}" seeded.`);
        } else {
          console.log(`Module "${unitData.moduleName}" not found for Unity "${unitData.title}". Skipping.`);
        }
      } else {
        console.log(`Unity "${unitData.title}" already exists. Skipping.`);
      }
    }
  }
}
