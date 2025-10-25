import { DataSource } from "typeorm";
import { DataSourceAwareSeed } from "./data-source-aware-seed";
import { Unity } from "../../features/unity/entities/unity.entity";
import { User } from "../../auth/entities/user.entity";
import { Module } from "../../features/module/entities/module.entity";


export class UnitySeeder extends DataSourceAwareSeed {
  constructor(dataSource: DataSource) {
    super(dataSource);
  }

  async run(): Promise<void> {
    const unityRepository = this.dataSource.getRepository(Unity);
    const userRepository = this.dataSource.getRepository(User);
    const moduleRepository = this.dataSource.getRepository(Module);

    // Obtener el primer usuario de la base de datos
    const users = await userRepository.find({ take: 1 });
    const firstUser = users[0];

    if (!firstUser) {
      console.warn("[UnitySeeder] No se encontraron usuarios. No se pueden crear unidades.");
      return;
    }

    // Obtener todos los módulos existentes
    const modules = await moduleRepository.find();
    if (modules.length === 0) {
      console.warn("[UnitySeeder] No se encontraron módulos. No se pueden crear unidades.");
      return;
    }

    // Mapear módulos por nombre para fácil acceso
    const moduleMap = new Map<string, Module>();
    modules.forEach(mod => moduleMap.set(mod.name, mod));

    const unitiesData = [
      // Módulo: Introducción al Idioma
      { title: 'Fundamentos del Kamëntsá', description: 'Una introducción completa al idioma Kamëntsá, su historia, cultura y estructura básica.', moduleName: 'Introducción al Idioma', order: 1 },

      // Módulo: Fonética y Pronunciación
      { title: 'Los Sonidos del Kamëntsá', description: 'Estudio detallado de las vocales, consonantes y la pronunciación correcta en Kamëntsá.', moduleName: 'Fonética y Pronunciación', order: 2 },

      // Módulo: Gramática Fundamental
      { title: 'La Estructura de las Palabras', description: 'Análisis de sustantivos, verbos, pronombres y la estructura gramatical del Kamëntsá.', moduleName: 'Gramática Fundamental', order: 3 },

      // Módulo: Diccionario Bilingüe
      { title: 'Construyendo tu Vocabulario', description: 'Exploración del vocabulario Kamëntsá a través de categorías temáticas como saludos, familia, números y más.', moduleName: 'Diccionario Bilingüe', order: 4 },

      // Módulo: Cultura y Tradición
      { title: 'Inmersión Cultural', description: 'Descubre la riqueza de la cultura Kamëntsá a través de sus mitos, leyendas, música y tradiciones.', moduleName: 'Cultura y Tradición', order: 5 },

      // Módulo: Recursos Adicionales
      { title: 'Herramientas para tu Aprendizaje', description: 'Recursos complementarios, ejercicios prácticos y material multimedia para reforzar tu conocimiento.', moduleName: 'Recursos Adicionales', order: 6 },
    ];

    for (const unityData of unitiesData) {
      const existingUnity = await unityRepository.findOne({
        where: {
          title: unityData.title,
        },
      });

      if (!existingUnity) {
        const module = moduleMap.get(unityData.moduleName);
        if (module) {
          const newUnity = unityRepository.create({
            title: unityData.title,
            description: unityData.description,
            userId: firstUser.id,
            moduleId: module.id, // Asociar al módulo encontrado
            order: unityData.order,
          });
          try {
            await unityRepository.save(newUnity);
            console.log(`[UnitySeeder] Unidad "${newUnity.title}" creada y asociada al módulo "${module.name}".`);
          } catch (error) {
            console.error(`[UnitySeeder] Error al crear unidad "${newUnity.title}":`, error.message);
          }
        } else {
          console.warn(`[UnitySeeder] Módulo "${unityData.moduleName}" no encontrado para la unidad "${unityData.title}". Saltando.`);
        }
      } else {
        console.log(`[UnitySeeder] Unidad "${unityData.title}" ya existe.`);
      }
    }
  }
}
