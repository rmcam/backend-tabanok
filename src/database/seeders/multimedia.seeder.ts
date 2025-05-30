import { DataSource, Repository } from 'typeorm';
import { DataSourceAwareSeed } from './data-source-aware-seed';
import { Multimedia } from '../../features/multimedia/entities/multimedia.entity';
import { Lesson } from '../../features/lesson/entities/lesson.entity';
import { User } from '../../auth/entities/user.entity';
import { Content } from '../../features/content/entities/content.entity'; // Importar Content

export class MultimediaSeeder extends DataSourceAwareSeed {
  constructor(dataSource: DataSource) {
    super(dataSource);
  }

  async run(): Promise<void> {
    const multimediaRepository = this.dataSource.getRepository(Multimedia);
    const lessonRepository = this.dataSource.getRepository(Lesson);
    const userRepository = this.dataSource.getRepository(User);
    const contentRepository = this.dataSource.getRepository(Content); // Obtener el ContentRepository

    const lessons = await lessonRepository.find();
    const users = await userRepository.find();
    const contents = await contentRepository.find(); // Obtener todo el contenido

    const defaultUserId = users.length > 0 ? users[0].id : null;

    if (!defaultUserId) {
      console.warn('No users found. Skipping MultimediaSeeder.');
      return;
    }

    const multimediaData = [
      // Imágenes
      {
        fileName: 'alfabeto_kamentsa.jpg',
        filePath: '/uploads/images/alfabeto_kamentsa.jpg',
        fileType: 'image',
        mimeType: 'image/jpeg',
        size: 200000,
        lessonTitle: 'Bienvenida y Alfabeto', // Usar título para buscar la lección
        contentTitle: 'Letra A', // Ejemplo: asociar a un contenido específico
        userId: defaultUserId,
      },
      {
        fileName: 'familia_tradicional.png',
        filePath: '/uploads/images/familia_tradicional.png',
        fileType: 'image',
        mimeType: 'image/png',
        size: 300000,
        lessonTitle: 'Familia y Comunidad',
        contentTitle: 'Miembros de la familia',
        userId: defaultUserId,
      },
      {
        fileName: 'mapa_putumayo.jpg',
        filePath: '/uploads/images/mapa_putumayo.jpg',
        fileType: 'image',
        mimeType: 'image/jpeg',
        size: 400000,
        lessonTitle: 'Historia del Pueblo Kamëntsá',
        contentTitle: 'Eventos Históricos Clave',
        userId: defaultUserId,
      },
      {
        fileName: 'artesania_kamentsa.jpg',
        filePath: '/uploads/images/artesania_kamentsa.jpg',
        fileType: 'image',
        mimeType: 'image/jpeg',
        size: 350000,
        lessonTitle: 'Artesanía y Vestimenta',
        contentTitle: 'Artesanía y Vestimenta Tradicional',
        userId: defaultUserId,
      },
      {
        fileName: 'planta_medicinal.png',
        filePath: '/uploads/images/planta_medicinal.png',
        fileType: 'image',
        mimeType: 'image/png',
        size: 280000,
        lessonTitle: 'Comida y Naturaleza',
        contentTitle: 'Nombres de comidas y elementos naturales',
        userId: defaultUserId,
      },

      // Videos
      {
        fileName: 'saludo_tradicional.mp4',
        filePath: '/uploads/videos/saludo_tradicional.mp4',
        fileType: 'video',
        mimeType: 'video/mp4',
        size: 8000000,
        lessonTitle: 'Saludos y Presentaciones',
        contentTitle: 'Saludos y Despedidas',
        userId: defaultUserId,
      },
      {
        fileName: 'ritual_kamentsa.mov',
        filePath: '/uploads/videos/ritual_kamentsa.mov',
        fileType: 'video',
        mimeType: 'video/quicktime',
        size: 12000000,
        lessonTitle: 'Cultura y Tradiciones', // Asumiendo una lección general de cultura
        contentTitle: 'Rituales y Ceremonias',
        userId: defaultUserId,
      },
      {
        fileName: 'clase_fonetica.mp4',
        filePath: '/uploads/videos/clase_fonetica.mp4',
        fileType: 'video',
        mimeType: 'video/mp4',
        size: 10000000,
        lessonTitle: 'Vocales y Consonantes',
        contentTitle: 'Sonidos del Kamëntsá',
        userId: defaultUserId,
      },

      // Audios
      {
        fileName: 'pronunciacion_basica.mp3',
        filePath: '/uploads/audio/pronunciacion_basica.mp3',
        fileType: 'audio',
        mimeType: 'audio/mpeg',
        size: 1500000,
        lessonTitle: 'Fonética y Pronunciación',
        contentTitle: 'Reglas de Pronunciación',
        userId: defaultUserId,
      },
      {
        fileName: 'dialogo_cotidiano.mp3',
        filePath: '/uploads/audio/dialogo_cotidiano.mp3',
        fileType: 'audio',
        mimeType: 'audio/mpeg',
        size: 2500000,
        lessonTitle: 'Conversación Cotidiana',
        contentTitle: 'Diálogos y Expresiones Comunes',
        userId: defaultUserId,
      },
      {
        fileName: 'cancion_tradicional.wav',
        filePath: '/uploads/audio/cancion_tradicional.wav',
        fileType: 'audio',
        mimeType: 'audio/wav',
        size: 3500000,
        lessonTitle: 'La Música Kamëntsá',
        contentTitle: 'Música y Instrumentos Tradicionales',
        userId: defaultUserId,
      },

      // Documentos
      {
        fileName: 'gramatica_fundamental.pdf',
        filePath: '/uploads/documents/gramatica_fundamental.pdf',
        fileType: 'document',
        mimeType: 'application/pdf',
        size: 1500000,
        lessonTitle: 'Gramática Fundamental',
        contentTitle: 'Estructura básica de las oraciones',
        userId: defaultUserId,
      },
      {
        fileName: 'cuento_corto.pdf',
        filePath: '/uploads/documents/cuento_corto.pdf',
        fileType: 'document',
        mimeType: 'application/pdf',
        size: 800000,
        lessonTitle: 'Lectura y Escritura', // Asumiendo una lección de lectura
        contentTitle: 'Cuentos y Narraciones',
        userId: defaultUserId,
      },
       {
        fileName: 'lista_verbos.pdf',
        filePath: '/uploads/documents/lista_verbos.pdf',
        fileType: 'document',
        mimeType: 'application/pdf',
        size: 1200000,
        lessonTitle: 'Tiempos Verbales Básicos',
        contentTitle: 'Conjugación de verbos comunes',
        userId: defaultUserId,
      },
    ];

    const multimediaToSave: Multimedia[] = [];
    for (const data of multimediaData) {
      const lesson = lessons.find(l => l.title === data.lessonTitle);
      const content = contents.find(c => c.title === data.contentTitle); // Buscar contenido por título

      const newMultimedia = multimediaRepository.create({
        fileName: data.fileName,
        filePath: data.filePath,
        fileType: data.fileType,
        mimeType: data.mimeType,
        size: data.size,
        lesson: lesson || null, // Asociar lección
        userId: data.userId,
      });
      multimediaToSave.push(newMultimedia);

      // Si se encontró contenido, asociar la multimedia al contenido
      if (content) {
        if (!content.multimedia) {
          content.multimedia = [];
        }
        content.multimedia.push(newMultimedia);
        await contentRepository.save(content); // Guardar el contenido para actualizar la relación ManyToMany
      } else {
        console.warn(`[MultimediaSeeder] Content with title "${data.contentTitle}" not found for multimedia "${data.fileName}". Skipping content association.`);
      }
    }

    // Usar upsert para la multimedia
    await multimediaRepository.upsert(
      multimediaToSave,
      {
        conflictPaths: ["fileName", "filePath"], // Conflict based on fileName and filePath
        skipUpdateIfNoValuesChanged: true,
      }
    );

    console.log('Multimedia seeder finished.');
  }
}
