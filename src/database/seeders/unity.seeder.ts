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
      { title: 'Introducción al Kamëntsá', description: 'Introducción al idioma Kamëntsá y su contexto cultural.', moduleName: 'Introducción al Idioma' },
      { title: 'Vocales y Consonantes', description: 'Estudio de los sonidos del idioma Kamëntsá, incluyendo vocales, consonantes y patrones de acentuación.', moduleName: 'Fonética y Pronunciación' },
      { title: 'Gramática Fundamental', description: 'Estructura gramatical del idioma Kamëntsá, incluyendo sustantivos, verbos y pronombres.', moduleName: 'Gramática Fundamental' },
      { title: 'Vocabulario General', description: 'Contiene las entradas del diccionario Kamëntsá-Español y Español-Kamëntsá.', moduleName: 'Diccionario Bilingüe' },
      { title: 'Contenido del Diccionario', description: 'Recursos adicionales y anexos relacionados con el diccionario y el aprendizaje del idioma Kamëntsá.', moduleName: 'Recursos Adicionales' },
      { title: 'Clasificadores Nominales Detallados', description: 'Guía detallada de los sufijos clasificadores nominales en Kamëntsá.', moduleName: 'Clasificadores Nominales' },
      { title: 'El Alfabeto Kamëntsá Completo', description: 'Un sistema de 32 letras para la escritura y estudio de la lengua Kamëntsá.', moduleName: 'El Alfabeto Kamëntsá' },
      { title: 'Articulación de Sonidos Específicos', description: 'Descripción fonética detallada de los sonidos más distintivos y complejos del Kamëntsá.', moduleName: 'Articulación Detallada' },
      { title: 'Grupos Consonánticos y Reglas de Unión', description: 'Combinaciones sonoras fundamentales para la pronunciación correcta en Kamëntsá.', moduleName: 'Combinaciones Sonoras' },
      { title: 'Sistema Consonántico Kamëntsá', description: 'Clasificación y descripción de las consonantes del Kamëntsá.', moduleName: 'Las Consonantes Kamëntsá' },
      { title: 'Número en Sustantivos Kamëntsá', description: 'Uso de sufijos para singular, dual y plural en sustantivos Kamëntsá.', moduleName: 'Número en Sustantivos' },
      { title: 'Acentuación y Ritmo del Idioma', description: 'Patrones de acentuación cruciales para la pronunciación y el ritmo natural del Kamëntsá.', moduleName: 'Patrones de Acentuación' },
      { title: 'Pronombres Personales Kamëntsá', description: 'Uso de pronombres personales para referirse a participantes en la comunicación.', moduleName: 'Pronombres Personales' },
      { title: 'Guía Completa de Pronunciación', description: 'Reglas y sonidos únicos esenciales para dominar la pronunciación en Kamëntsá.', moduleName: 'Guía de Pronunciación' },
      { title: 'Sustantivos: Radical y Clasificador', description: 'Estructura básica de los sustantivos en Kamëntsá y sus clasificadores.', moduleName: 'Sustantivos Kamëntsá' },
      { title: 'Variaciones Regionales del Kamëntsá', description: 'Diferencias en la pronunciación y el uso de sonidos según la región geográfica.', moduleName: 'Variaciones Dialectales' },
      { title: 'Verbos: Tipos y Conjugaciones', description: 'Clasificación, conjugación y patrones de uso de los verbos en Kamëntsá.', moduleName: 'Verbos Kamëntsá' },
      { title: 'Sistema Vocálico Kamëntsá', description: 'Las seis vocales del Kamëntsá, incluyendo la vocal intermedia distintiva.', moduleName: 'Las Vocales Kamëntsá' },
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
