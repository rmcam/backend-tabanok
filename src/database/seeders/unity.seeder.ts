import { DataSourceAwareSeed } from './data-source-aware-seed'; 
import { DataSource } from 'typeorm';
import { Unity } from '../../features/unity/entities/unity.entity';
import { Module } from '../../features/module/entities/module.entity';
import { User } from '../../auth/entities/user.entity'; // Importar User
import { UserRole } from '../../auth/enums/auth.enum'; // Importar UserRole

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
      // Asegurar que estas unidades se crean con estos nombres exactos
      { title: 'Bienvenida y Alfabeto', description: 'Introducción al alfabeto Kamëntsá y sus particularidades.', moduleName: 'Introducción al Kamëntsá' },
      { title: 'Vocales y Consonantes', description: 'Estudio detallado de los sonidos vocálicos y consonánticos del Kamëntsá.', moduleName: 'Fonética y Pronunciación' },
      { title: 'Saludos y Presentaciones', description: 'Frases básicas y formales para interactuar y presentarse.', moduleName: 'Introducción al Kamëntsá' },
      { title: 'Acentuación y Entonación', description: 'Reglas de acentuación y patrones de entonación en diferentes tipos de oraciones.', moduleName: 'Fonética y Pronunciación' },
      { title: 'Estructura de la Oración', description: 'Orden de las palabras, tipos de oraciones simples y compuestas.', moduleName: 'Gramática Fundamental' },
      { title: 'Tiempos Verbales Básicos', description: 'Conjugación de verbos comunes en presente, pasado y futuro.', moduleName: 'Gramática Fundamental' },
      { title: 'Familia y Comunidad', description: 'Vocabulario relacionado con los miembros de la familia y la estructura comunitaria.', moduleName: 'Vocabulario Esencial' },
      { title: 'Comida y Naturaleza', description: 'Vocabulario sobre alimentos tradicionales, plantas y animales del entorno natural.', moduleName: 'Vocabulario Esencial' },
      { title: 'Aspectos de la Vida Diaria', description: 'Vocabulario y frases para situaciones cotidianas como ir de compras, transporte, etc.', moduleName: 'Conversación Cotidiana' },
      { title: 'Interacciones Sociales', description: 'Cómo comunicarse en diferentes contextos sociales, incluyendo peticiones y agradecimientos.', moduleName: 'Conversación Cotidiana' },
      { title: 'Mitos y Leyendas', description: 'Exploración de las historias tradicionales que explican el origen del mundo y del pueblo Kamëntsá.', moduleName: 'Cultura y Tradiciones' },
      { title: 'Rituales y Ceremonias', description: 'Conocimiento sobre prácticas culturales importantes, festividades y su significado.', moduleName: 'Cultura y Tradiciones' },
      { title: 'Principios de Escritura', description: 'Fundamentos para escribir en Kamëntsá, incluyendo el uso del alfabeto y la puntuación.', moduleName: 'Lectura y Escritura' },
      { title: 'Textos Sencillos', description: 'Práctica de lectura con textos cortos como cuentos, poemas y descripciones.', moduleName: 'Lectura y Escritura' },
      { title: 'Contenido del Diccionario', description: 'Secciones y entradas del diccionario Kamëntsá-Español, cómo buscar y utilizar la información.', moduleName: 'Introducción al Kamëntsá' },
      { title: 'Frases Hechas', description: 'Ejemplos y uso de expresiones idiomáticas comunes en Kamëntsá.', moduleName: 'Expresiones Idiomáticas' },
      { title: 'Proverbios y Dichos', description: 'Significado y origen de refranes populares y su aplicación en la vida diaria.', moduleName: 'Expresiones Idiomáticas' },
      { title: 'Orígenes y Migraciones', description: 'Historia temprana del pueblo Kamëntsá, sus movimientos y asentamientos.', moduleName: 'Historia del Pueblo Kamëntsá' },
      { title: 'El Pueblo Kamëntsá Hoy', description: 'Situación actual y desafíos de la comunidad Kamëntsá, su organización social y política.', moduleName: 'Historia del Pueblo Kamëntsá' },
      { title: 'Vocabulario General', description: 'Unidad general para vocabulario diverso no cubierto en otras unidades.', moduleName: 'Vocabulario Esencial' },
      { title: 'Conceptos Fundamentales', description: 'Unidad para conceptos fundamentales del idioma y la cultura.', moduleName: 'Introducción al Kamëntsá' },
      // Nuevas unidades para mayor realismo
      { title: 'Números y Cantidades', description: 'Aprende a contar y expresar cantidades en Kamëntsá.', moduleName: 'Vocabulario Esencial' },
      { title: 'Colores y Formas', description: 'Vocabulario para describir colores y formas de objetos.', moduleName: 'Vocabulario Esencial' },
      { title: 'El Cuerpo Humano', description: 'Vocabulario relacionado con las partes del cuerpo y la salud.', moduleName: 'Vocabulario Esencial' },
      { title: 'Animales y Plantas Nativas', description: 'Identificación y nombres de la flora y fauna local.', moduleName: 'Vocabulario Esencial' },
      { title: 'Preguntas y Respuestas', description: 'Cómo formular y responder preguntas en diferentes contextos.', moduleName: 'Conversación Cotidiana' },
      { title: 'Narración de Eventos', description: 'Practica la descripción de eventos pasados y futuros.', moduleName: 'Conversación Cotidiana' },
      { title: 'Expresión de Sentimientos', description: 'Vocabulario y frases para expresar emociones y estados de ánimo.', moduleName: 'Conversación Cotidiana' },
      { title: 'La Música Kamëntsá', description: 'Exploración de los instrumentos, ritmos y canciones tradicionales.', moduleName: 'Cultura y Tradiciones' },
      { title: 'Artesanía y Vestimenta', description: 'Conocimiento sobre las técnicas artesanales y la vestimenta tradicional.', moduleName: 'Cultura y Tradiciones' },
      { title: 'Escritura de Textos Narrativos', description: 'Principios para escribir historias y relatos cortos.', moduleName: 'Lectura y Escritura' },
      { title: 'Comprensión de Textos Escritos', description: 'Estrategias para entender diferentes tipos de textos en Kamëntsá.', moduleName: 'Lectura y Escritura' },
      { title: 'Variaciones Dialectales', description: 'Introducción a las posibles variaciones del idioma en diferentes regiones.', moduleName: 'Fonética y Pronunciación' },
      { title: 'Sintaxis Avanzada', description: 'Estudio de estructuras gramaticales más complejas.', moduleName: 'Gramática Fundamental' },
      { title: 'El Calendario Kamëntsá', description: 'Conocimiento sobre el calendario tradicional y sus ciclos.', moduleName: 'Historia del Pueblo Kamëntsá' },
    ];

    // Obtener usuarios administradores y profesores
    const adminUsers = await userRepository.find({ where: { role: UserRole.ADMIN } });
    const teacherUsers = await userRepository.find({ where: { role: UserRole.TEACHER } });
    const contentCreators = [...adminUsers, ...teacherUsers];

    if (contentCreators.length === 0) {
        console.log('No admin or teacher users found. Skipping UnitySeeder.');
        return;
    }


    for (let i = 0; i < unitsToSeed.length; i++) {
      const unitData = unitsToSeed[i];
      const existingUnit = await unityRepository.findOne({ where: { title: unitData.title } });

      if (!existingUnit) {
        const module = modules.find(m => m.name === unitData.moduleName);
        if (module) {
          // Asignar un creador de contenido de forma rotatoria
          const creator = contentCreators[i % contentCreators.length];
          const newUnit = unityRepository.create({
            title: unitData.title,
            description: unitData.description,
            module: module,
            user: creator,
            userId: creator.id,
          });
          await unityRepository.save(newUnit);
          console.log(`Unity "${unitData.title}" seeded by user "${creator.email}".`);
        } else {
          console.log(`Module "${unitData.moduleName}" not found for Unity "${unitData.title}". Skipping.`);
        }
      } else {
        console.log(`Unity "${unitData.title}" already exists. Skipping.`);
      }
    }
  }
}
