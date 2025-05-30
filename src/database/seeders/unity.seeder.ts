import * as fs from 'fs';
import * as path from 'path';
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
    console.log("[UnitySeeder] Starting to run seeder.");
    const unityRepository = this.dataSource.getRepository(Unity);
    const moduleRepository = this.dataSource.getRepository(Module);
    const userRepository = this.dataSource.getRepository(User);

    const users = await userRepository.find({ take: 1 });
    const firstUser = users[0];

    if (!firstUser) {
      console.warn("[UnitySeeder] No se encontraron usuarios. No se pueden crear unidades.");
      return;
    }

    const modules = await moduleRepository.find();
    if (modules.length === 0) {
      console.warn("[UnitySeeder] No se encontraron módulos. No se pueden crear unidades.");
      return;
    }
    const moduleMap = new Map<string, Module>();
    modules.forEach(module => moduleMap.set(module.name, module));

    // Leer lesson_mappings.json para obtener las unidades
    const lessonMappingsPath = path.resolve(__dirname, '../files/json/lesson_mappings.json');
    let lessonMappings: any;
    try {
      lessonMappings = JSON.parse(fs.readFileSync(lessonMappingsPath, 'utf-8'));
      console.log(`[UnitySeeder] Successfully read lesson_mappings.json`);
    } catch (error: any) {
      console.error(`[UnitySeeder] Error reading lesson_mappings.json: ${error.message}`);
      return;
    }

    const unitiesDataFromMappings = lessonMappings.units || [];
    console.log(`[UnitySeeder] Found ${unitiesDataFromMappings.length} units in lesson_mappings.json.`);

    // Mapeo de títulos de unidad a nombres de módulo (ajustar según los módulos existentes)
    const unityToModuleNameMap: { [key: string]: string } = {
      "Fundamentos del Kamëntsá": "Introducción al Kamëntsá",
      "Vocales y Consonantes": "Fonética y Pronunciación",
      "Saludos y Presentaciones": "Conversación Cotidiana",
      "Conversación Cotidiana": "Conversación Cotidiana",
      "El Cuerpo Humano": "Vocabulario Esencial",
      "Familia y Comunidad": "Vocabulario Esencial",
      "Comida y Naturaleza": "Vocabulario Esencial",
      "Colores y Formas": "Vocabulario Esencial",
      "Animales y Plantas Nativas": "Vocabulario Esencial",
      "Tiempos Verbales Básicos": "Gramática Fundamental",
      "Estructura de la Oración": "Gramática Fundamental",
      "Números y Cantidades": "Vocabulario Esencial",
      "Aspectos de la Vida Diaria": "Conversación Cotidiana",
      "Direcciones y Lugares": "Conversación Cotidiana",
      "Expresión de Sentimientos": "Expresiones Idiomáticas",
      "Historia del Pueblo Kamëntsá": "Historia del Pueblo Kamëntsá",
      "La Música Kamëntsá": "Cultura y Tradiciones",
      "Artesanía y Vestimenta": "Cultura y Tradiciones",
      "Vocabulario General": "Vocabulario Esencial",
      "Contenido del Diccionario": "Vocabulario Esencial",
      "Introducción al Idioma": "Introducción al Kamëntsá", // Para lecciones genéricas
      "Fonética y Pronunciación": "Fonética y Pronunciación", // Para lecciones genéricas
      "Gramática Fundamental": "Gramática Fundamental", // Para lecciones genéricas
      "Conceptos de Lectura": "Lectura y Escritura",
      "Práctica de Escritura": "Lectura y Escritura",
      "Frases Comunes": "Expresiones Idiomáticas",
      "Modismos Kamëntsá": "Expresiones Idiomáticas",
      "Eventos Históricos Clave": "Historia del Pueblo Kamëntsá",
      "Figuras Históricas": "Historia del Pueblo Kamëntsá",
    };

    const defaultModuleName = "Vocabulario Esencial"; // Módulo por defecto si no se encuentra un mapeo

    for (const unityData of unitiesDataFromMappings) {
      let moduleName = unityToModuleNameMap[unityData.title];
      if (!moduleName) {
        // Intentar inferir el módulo si no hay un mapeo directo
        const normalizedUnityTitle = unityData.title.toLowerCase();
        for (const [modName, moduleEntity] of moduleMap.entries()) {
          if (normalizedUnityTitle.includes(modName.toLowerCase())) {
            moduleName = modName;
            break;
          }
        }
      }

      const targetModule = moduleName ? moduleMap.get(moduleName) : null;

      if (!targetModule) {
        console.warn(`[UnitySeeder] Módulo "${moduleName || 'desconocido'}" no encontrado para la unidad "${unityData.title}". Intentando con módulo por defecto.`);
        const defaultModule = moduleMap.get(defaultModuleName);
        if (defaultModule) {
          console.log(`[UnitySeeder] Asignando unidad "${unityData.title}" al módulo por defecto "${defaultModuleName}".`);
          this.createOrUpdateUnity(unityRepository, firstUser, defaultModule, unityData);
        } else {
          console.error(`[UnitySeeder] Módulo por defecto "${defaultModuleName}" no encontrado. No se puede sembrar la unidad "${unityData.title}".`);
        }
      } else {
        this.createOrUpdateUnity(unityRepository, firstUser, targetModule, unityData);
      }
    }

    console.log("[UnitySeeder] Proceso de siembra de unidades completado.");
  }

  private async createOrUpdateUnity(
    unityRepository: any,
    firstUser: User,
    targetModule: Module,
    unityData: any
  ): Promise<void> {
    const existingUnity = await unityRepository.findOne({
      where: {
        title: unityData.title,
        user: { id: firstUser.id },
        module: { id: targetModule.id },
      },
    });

    if (!existingUnity) {
      const newUnity = unityRepository.create({
        id: unityData.id || uuidv4(), // Usar el ID del JSON si existe, sino generar uno
        title: unityData.title,
        description: unityData.description,
        order: unityData.order || 0, // Añadir campo order
        user: firstUser,
        module: targetModule,
      });
      try {
        await unityRepository.save(newUnity);
        console.log(`[UnitySeeder] Unidad "${newUnity.title}" creada y asociada al módulo "${targetModule.name}".`);
      } catch (error: any) {
        console.error(`[UnitySeeder] Error al crear unidad "${newUnity.title}":`, error.message);
      }
    } else {
      // Actualizar si ya existe (opcional, pero buena práctica para idempotencia)
      existingUnity.description = unityData.description;
      existingUnity.order = unityData.order || 0;
      existingUnity.module = targetModule; // Asegurar que el módulo esté actualizado
      try {
        await unityRepository.save(existingUnity);
        console.log(`[UnitySeeder] Unidad "${unityData.title}" ya existe y fue actualizada para el módulo "${targetModule.name}".`);
      } catch (error: any) {
        console.error(`[UnitySeeder] Error al actualizar unidad "${unityData.title}":`, error.message);
      }
    }
  }
}
