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

    const unities = [
      { title: "Bienvenida y Alfabeto", description: "Unidad introductoria al idioma Kamëntsá." },
      { title: "Vocales y Consonantes", description: "Exploración de los sonidos del Kamëntsá." },
      { title: "Saludos y Presentaciones", description: "Frases comunes para saludar y presentarse." },
      { title: "Conversación Cotidiana", description: "Vocabulario para conversaciones diarias." },
      { title: "El Cuerpo Humano", description: "Partes del cuerpo en Kamëntsá." },
      { title: "La Familia", description: "Miembros de la familia en Kamëntsá." },
      { title: "Comida y Naturaleza", description: "Nombres de comidas y elementos naturales." },
      { title: "Colores y Formas", description: "Colores y formas básicas." },
      { title: "Animales y Plantas Nativas", description: "Flora y fauna local." },
      { title: "Tiempos Verbales Básicos", description: "Conjugación de verbos comunes." },
      { title: "Estructura de la Oración", description: "Cómo construir oraciones en Kamëntsá." },
      { title: "Números y Cantidades", description: "Contar en Kamëntsá." },
      { title: "Aspectos de la Vida Diaria", description: "Vocabulario relacionado con la rutina diaria." },
      { title: "Direcciones y Lugares", description: "Cómo dar y recibir direcciones." },
      { title: "Expresión de Sentimientos", description: "Expresar emociones en Kamëntsá." },
      { title: "Historia del Pueblo Kamëntsá", description: "Historia y tradiciones del pueblo Kamëntsá." },
      { title: "La Música Kamëntsá", description: "Música y instrumentos tradicionales." },
      { title: "Artesanía y Vestimenta", description: "Artesanía y vestimenta tradicional." },
      { title: "Vocabulario General", description: "Vocabulario básico en Kamëntsá." },
      { title: "Contenido del Diccionario", description: "Contenido del diccionario Kamëntsá." },
      { title: "Introducción al Kamëntsá", description: "Introducción al idioma Kamëntsá." },
      { title: "Fonética y Pronunciación", description: "Guía de pronunciación del Kamëntsá." },
      { title: "Gramática Fundamental", description: "Gramática básica del Kamëntsá." },
    ];

    // Obtener el primer usuario de la base de datos
    const userRepository = this.dataSource.getRepository(User);
    const users = await userRepository.find({ take: 1 });
    const firstUser = users[0];

    if (!firstUser) {
      console.warn("[UnitySeeder] No se encontraron usuarios. No se pueden crear unidades.");
      return;
    }

    // Obtener el primer módulo de la base de datos
    const moduleRepository = this.dataSource.getRepository(Module);
    const modules = await moduleRepository.find({ take: 1 });
    const firstModule = modules[0];

    if (!firstModule) {
      console.warn("[UnitySeeder] No se encontraron módulos. No se pueden crear unidades.");
      return;
    }

    for (const unity of unities) {
      const existingUnity = await unityRepository.findOne({
        where: {
          title: unity.title,
          user: { id: firstUser.id },
          module: { id: firstModule.id },
        },
      });

      if (!existingUnity) {
        const newUnity = unityRepository.create({
          id: uuidv4(),
          title: unity.title,
          description: unity.description,
          user: firstUser,
          module: firstModule,
        });
        try {
          await unityRepository.save(newUnity);
          console.log(`[UnitySeeder] Unidad "${newUnity.title}" creada.`);
        } catch (error) {
          console.error(`[UnitySeeder] Error al crear unidad "${newUnity.title}":`, error.message);
        }
      } else {
        console.log(`[UnitySeeder] Unidad "${unity.title}" ya existe.`);
      }
    }
  }
}
