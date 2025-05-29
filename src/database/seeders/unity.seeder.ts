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

    // Definir las unidades y el módulo al que deben pertenecer
    const unitiesData = [
      { title: "Bienvenida y Alfabeto", description: "Unidad introductoria al idioma Kamëntsá.", moduleName: "Introducción al Kamëntsá" },
      { title: "Vocales y Consonantes", description: "Exploración de los sonidos del Kamëntsá.", moduleName: "Fonética y Pronunciación" },
      { title: "Saludos y Presentaciones", description: "Frases comunes para saludar y presentarse.", moduleName: "Vocabulario Esencial" },
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
      { title: "Expresión de Sentimientos", description: "Expresar emociones en Kamëntsá.", moduleName: "Conversación Cotidiana" },
      { title: "Historia del Pueblo Kamëntsá", description: "Historia y tradiciones del pueblo Kamëntsá.", moduleName: "Cultura y Tradiciones" },
      { title: "La Música Kamëntsá", description: "Música y instrumentos tradicionales.", moduleName: "Cultura y Tradiciones" },
      { title: "Artesanía y Vestimenta", description: "Artesanía y vestimenta tradicional.", moduleName: "Cultura y Tradiciones" },
      { title: "Vocabulario General", description: "Vocabulario básico en Kamëntsá.", moduleName: "Vocabulario Esencial" },
      { title: "Contenido del Diccionario", description: "Contenido del diccionario Kamëntsá.", moduleName: "Vocabulario Esencial" },
      { title: "Introducción al Kamëntsá", description: "Introducción al idioma Kamëntsá.", moduleName: "Introducción al Kamëntsá" },
      { title: "Fonética y Pronunciación", description: "Guía de pronunciación del Kamëntsá.", moduleName: "Fonética y Pronunciación" },
      { title: "Gramática Fundamental", description: "Gramática básica del Kamëntsá.", moduleName: "Gramática Fundamental" },
    ];

    for (const unityData of unitiesData) {
      const targetModule = moduleMap.get(unityData.moduleName);

      if (!targetModule) {
        console.warn(`[UnitySeeder] Módulo "${unityData.moduleName}" no encontrado para la unidad "${unityData.title}". Saltando.`);
        continue; // Saltar esta unidad si el módulo no existe
      }

      const existingUnity = await unityRepository.findOne({
        where: {
          title: unityData.title,
          user: { id: firstUser.id },
          module: { id: targetModule.id }, // Usar el ID del módulo correcto
        },
      });

      if (!existingUnity) {
        const newUnity = unityRepository.create({
          id: uuidv4(),
          title: unityData.title,
          description: unityData.description,
          user: firstUser,
          module: targetModule, // Asignar el módulo correcto
        });
        try {
          await unityRepository.save(newUnity);
          console.log(`[UnitySeeder] Unidad "${newUnity.title}" creada y asociada al módulo "${targetModule.name}".`);
        } catch (error) {
          console.error(`[UnitySeeder] Error al crear unidad "${newUnity.title}":`, error.message);
        }
      } else {
        console.log(`[UnitySeeder] Unidad "${unityData.title}" ya existe y está asociada al módulo "${targetModule.name}".`);
      }
    }
  }
}
