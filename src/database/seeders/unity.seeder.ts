import { DataSource } from "typeorm";
import { DataSourceAwareSeed } from "./data-source-aware-seed";
import { v4 as uuidv4 } from 'uuid';
import { Unity } from "../../features/unity/entities/unity.entity";
import { User } from "../../auth/entities/user.entity";
import { Module } from "../../features/module/entities/module.entity";

export class UnitySeeder extends DataSourceAwareSeed {
  constructor(dataSource: DataSource) {
    super(dataSource);
  }

  async run(): Promise<void> {
    const unityRepository = this.dataSource.getRepository(Unity);
    const moduleRepository = this.dataSource.getRepository(Module);
    const userRepository = this.dataSource.getRepository(User);

    // Obtener el primer usuario de la base de datos
    const users = await userRepository.find({ take: 1 });
    const firstUser = users[0];

    if (!firstUser) {
      console.warn("[UnitySeeder] No se encontraron usuarios. No se pueden crear unidades.");
      return;
    }

    // Obtener todos los módulos de la base de datos y mapearlos por nombre para fácil acceso
    const modules = await moduleRepository.find();
    if (modules.length === 0) {
      console.warn("[UnitySeeder] No se encontraron módulos. No se pueden crear unidades.");
      return;
    }
    const moduleMap = new Map<string, Module>();
    modules.forEach(module => moduleMap.set(module.name, module));

    // Definir las unidades y el módulo al que deben pertenecer (mapeo semántico)
    const unitiesData = [
      { title: "Bienvenida y Alfabeto", description: "Unidad introductoria al idioma Kamëntsá.", moduleName: "Introducción al Kamëntsá" },
      { title: "Vocales y Consonantes", description: "Exploración de los sonidos del Kamëntsá.", moduleName: "Fonética y Pronunciación" },
      { title: "Saludos y Presentaciones", description: "Frases comunes para saludar y presentarse.", moduleName: "Conversación Cotidiana" },
      { title: "Conversación Cotidiana", description: "Vocabulario para conversaciones diarias.", moduleName: "Conversación Cotidiana" },
      { title: "El Cuerpo Humano", description: "Partes del cuerpo en Kamëntsá.", moduleName: "Vocabulario Esencial" },
      { title: "La Familia", description: "Miembros de la familia en Kamëntsá.", moduleName: "Vocabulario Esencial" },
      { title: "Comida y Naturaleza", description: "Nombres de comidas y elementos naturales.", moduleName: "Vocabulario Esencial" },
      { title: "Colores y Formas", description: "Colores y formas básicas.", moduleName: "Vocabulario Esencial" },
      { title: "Animales y Plantas Nativas", description: "Flora y fauna local.", moduleName: "Vocabulario Esencial" },
      { title: "Tiempos Verbales Básicos", description: "Conjugación de verbos comunes.", moduleName: "Gramática Fundamental" },
      { title: "Estructura de la Oración", description: "Cómo construir oraciones en Kamëntsá.", moduleName: "Gramática Fundamental" },
      { title: "Números y Cantidades", description: "Contar en Kamëntsá.", moduleName: "Vocabulario Esencial" },
      { title: "Aspectos de la Vida Diaria", description: "Vocabulario relacionado con la rutina diaria.", moduleName: "Conversación Cotidiana" },
      { title: "Direcciones y Lugares", description: "Cómo dar y recibir direcciones.", moduleName: "Conversación Cotidiana" },
      { title: "Expresión de Sentimientos", description: "Expresar emociones en Kamëntsá.", moduleName: "Expresiones Idiomáticas" }, // Re-asignado a Expresiones Idiomáticas
      { title: "Historia del Pueblo Kamëntsá", description: "Historia y tradiciones del pueblo Kamëntsá.", moduleName: "Historia del Pueblo Kamëntsá" }, // Re-asignado a Historia del Pueblo Kamëntsá
      { title: "La Música Kamëntsá", description: "Música y instrumentos tradicionales.", moduleName: "Cultura y Tradiciones" },
      { title: "Artesanía y Vestimenta", description: "Artesanía y vestimenta tradicional.", moduleName: "Cultura y Tradiciones" },
      { title: "Vocabulario General", description: "Vocabulario básico en Kamëntsá.", moduleName: "Vocabulario Esencial" },
      { title: "Contenido del Diccionario", description: "Contenido del diccionario Kamëntsá.", moduleName: "Vocabulario Esencial" },
      { title: "Introducción al Kamëntsá", description: "Introducción al idioma Kamëntsá.", moduleName: "Introducción al Kamëntsá" },
      { title: "Fonética y Pronunciación", description: "Guía de pronunciación del Kamëntsá.", moduleName: "Fonética y Pronunciación" },
      { title: "Gramática Fundamental", description: "Gramática básica del Kamëntsá.", moduleName: "Gramática Fundamental" },
      // Unidades adicionales para asegurar cobertura de módulos con menos unidades semánticas claras
      { title: "Conceptos de Lectura", description: "Principios básicos para leer en Kamëntsá.", moduleName: "Lectura y Escritura" }, // Nueva unidad para Lectura y Escritura
      { title: "Práctica de Escritura", description: "Ejercicios para escribir en Kamëntsá.", moduleName: "Lectura y Escritura" }, // Nueva unidad para Lectura y Escritura
      { title: "Frases Comunes", description: "Exploración de frases y dichos populares.", moduleName: "Expresiones Idiomáticas" }, // Nueva unidad para Expresiones Idiomáticas
      { title: "Modismos Kamëntsá", description: "Estudio de modismos y su significado.", moduleName: "Expresiones Idiomáticas" }, // Nueva unidad para Expresiones Idiomáticas
      { title: "Eventos Históricos Clave", description: "Fechas y eventos importantes en la historia Kamëntsá.", moduleName: "Historia del Pueblo Kamëntsá" }, // Nueva unidad para Historia del Pueblo Kamëntsá
      { title: "Figuras Históricas", description: "Personajes relevantes en la historia Kamëntsá.", moduleName: "Historia del Pueblo Kamëntsá" }, // Nueva unidad para Historia del Pueblo Kamëntsá
    ];

    // Crear un mapa para rastrear cuántas unidades se asignan a cada módulo
    const moduleUnitCounts = new Map<string, number>();
    modules.forEach(module => moduleUnitCounts.set(module.name, 0));

    const unassignedUnities: typeof unitiesData = [];

    for (const unityData of unitiesData) {
      const targetModule = moduleMap.get(unityData.moduleName);

      if (targetModule) {
        const existingUnity = await unityRepository.findOne({
          where: {
            title: unityData.title,
            user: { id: firstUser.id },
            module: { id: targetModule.id },
          },
        });

        if (!existingUnity) {
          const newUnity = unityRepository.create({
            id: uuidv4(),
            title: unityData.title,
            description: unityData.description,
            user: firstUser,
            module: targetModule,
          });
          try {
            await unityRepository.save(newUnity);
            console.log(`[UnitySeeder] Unidad "${newUnity.title}" creada y asociada al módulo "${targetModule.name}".`);
            moduleUnitCounts.set(targetModule.name, moduleUnitCounts.get(targetModule.name)! + 1);
          } catch (error) {
            console.error(`[UnitySeeder] Error al crear unidad "${newUnity.title}":`, error.message);
          }
        } else {
          console.log(`[UnitySeeder] Unidad "${unityData.title}" ya existe y está asociada al módulo "${targetModule.name}".`);
          moduleUnitCounts.set(targetModule.name, moduleUnitCounts.get(targetModule.name)! + 1);
        }
      } else {
        // Si el módulo no se encuentra, agregar la unidad a una lista de no asignadas
        unassignedUnities.push(unityData);
        console.warn(`[UnitySeeder] Módulo "${unityData.moduleName}" no encontrado para la unidad "${unityData.title}". Agregando a no asignadas.`);
      }
    }

    // Opcional: Asignar unidades no asignadas a módulos con pocas unidades si es necesario
    // Esta parte se puede ajustar o eliminar dependiendo de si queremos que todas las unidades se asignen
    // o si está bien tener algunas unidades sin un módulo asignado en el seeder.
    // Dado el feedback del usuario, parece que queremos que todos los módulos tengan unidades.
    // Podríamos iterar sobre los módulos y asignarles unidades de la lista de no asignadas
    // hasta que todos tengan al menos una, o distribuir las no asignadas de manera uniforme.

    // Para asegurar que todos los módulos tengan unidades, vamos a iterar sobre los módulos
    // y asignarles unidades de la lista unitiesData, priorizando el mapeo semántico
    // y luego distribuyendo las restantes.

    // Reiniciar el proceso de asignación para asegurar que todos los módulos reciban unidades
    console.log("[UnitySeeder] Re-asignando unidades para asegurar cobertura de módulos...");
    const assignedUnities = new Set<string>(); // Para rastrear unidades ya asignadas

    for (const module of modules) {
        let unitsAssignedToModule = 0;
        // Intentar asignar unidades con mapeo semántico primero
        for (const unityData of unitiesData) {
            if (unityData.moduleName === module.name && !assignedUnities.has(unityData.title)) {
                 const existingUnity = await unityRepository.findOne({
                    where: {
                        title: unityData.title,
                        user: { id: firstUser.id },
                        module: { id: module.id },
                    },
                });

                if (!existingUnity) {
                    const newUnity = unityRepository.create({
                        id: uuidv4(),
                        title: unityData.title,
                        description: unityData.description,
                        user: firstUser,
                        module: module,
                    });
                    try {
                        await unityRepository.save(newUnity);
                        console.log(`[UnitySeeder] Unidad "${newUnity.title}" asignada semánticamente al módulo "${module.name}".`);
                        assignedUnities.add(newUnity.title);
                        unitsAssignedToModule++;
                    } catch (error) {
                        console.error(`[UnitySeeder] Error al crear unidad "${newUnity.title}":`, error.message);
                    }
                } else {
                     console.log(`[UnitySeeder] Unidad "${unityData.title}" ya existe y está asignada semánticamente al módulo "${module.name}".`);
                     assignedUnities.add(unityData.title);
                     unitsAssignedToModule++;
                }
            }
        }

        // Si el módulo aún no tiene unidades (o tiene muy pocas, opcional), asignar unidades restantes
        // Aquí podríamos definir un umbral mínimo de unidades por módulo si es necesario.
        // Por ahora, solo nos aseguraremos de que tenga al menos una si es posible.
        if (unitsAssignedToModule === 0) {
            console.log(`[UnitySeeder] Módulo "${module.name}" no recibió unidades semánticas. Asignando unidades restantes.`);
            // Encontrar unidades que no han sido asignadas a ningún módulo semánticamente
            const trulyUnassigned = unitiesData.filter(unity => !assignedUnities.has(unity.title));

            if (trulyUnassigned.length > 0) {
                // Tomar la primera unidad no asignada y asignarla a este módulo
                const unityToAssign = trulyUnassigned.shift(); // Tomar y remover de la lista
                 const existingUnity = await unityRepository.findOne({
                    where: {
                        title: unityToAssign!.title,
                        user: { id: firstUser.id },
                        module: { id: module.id },
                    },
                });

                if (!existingUnity) {
                    const newUnity = unityRepository.create({
                        id: uuidv4(),
                        title: unityToAssign!.title,
                        description: unityToAssign!.description,
                        user: firstUser,
                        module: module,
                    });
                    try {
                        await unityRepository.save(newUnity);
                        console.log(`[UnitySeeder] Unidad restante "${newUnity.title}" asignada al módulo "${module.name}".`);
                        assignedUnities.add(newUnity.title);
                        unitsAssignedToModule++;
                    } catch (error) {
                        console.error(`[UnitySeeder] Error al crear unidad restante "${newUnity.title}":`, error.message);
                    }
                } else {
                     console.log(`[UnitySeeder] Unidad restante "${unityToAssign!.title}" ya existe y está asignada al módulo "${module.name}".`);
                     assignedUnities.add(unityToAssign!.title);
                     unitsAssignedToModule++;
                }
            } else {
                 console.warn(`[UnitySeeder] No hay unidades restantes para asignar al módulo "${module.name}".`);
            }
        }
    }


    console.log("[UnitySeeder] Proceso de siembra de unidades completado con asignación semántica.");
  }
}
