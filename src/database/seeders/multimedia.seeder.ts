import { DataSource, Repository } from 'typeorm';
import { DataSourceAwareSeed } from './data-source-aware-seed'; 
import { Multimedia } from '../../features/multimedia/entities/multimedia.entity';
import { Lesson } from '../../features/lesson/entities/lesson.entity';
import { User } from '../../auth/entities/user.entity'; // Importar la entidad User

export class MultimediaSeeder extends DataSourceAwareSeed {
  constructor(dataSource: DataSource) {
    super(dataSource);
  }

  async run(): Promise<void> {
    const multimediaRepository = this.dataSource.getRepository(Multimedia);
    const lessonRepository = this.dataSource.getRepository(Lesson);
    const userRepository = this.dataSource.getRepository(User); // Obtener el UserRepository

    // Obtener todas las lecciones existentes para asociar multimedia
    const lessons = await lessonRepository.find();

    // Obtener todos los usuarios existentes
    const users = await userRepository.find();

    // Asignar un userId válido (por ejemplo, el del primer usuario)
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
        lesson: lessons.find(l => l.title === 'Bienvenida y Alfabeto') || null,
        userId: defaultUserId, // Asignar userId
      },
      {
        fileName: 'familia_tradicional.png',
        filePath: '/uploads/images/familia_tradicional.png',
        fileType: 'image',
        mimeType: 'image/png',
        size: 300000,
        lesson: lessons.find(l => l.title === 'Familia y Comunidad') || null,
        userId: defaultUserId, // Asignar userId
      },
      {
        fileName: 'mapa_putumayo.jpg',
        filePath: '/uploads/images/mapa_putumayo.jpg',
        fileType: 'image',
        mimeType: 'image/jpeg',
        size: 400000,
        lesson: lessons.find(l => l.title === 'Historia del Pueblo Kamëntsá') || null,
        userId: defaultUserId, // Asignar userId
      },
      {
        fileName: 'artesania_kamentsa.jpg',
        filePath: '/uploads/images/artesania_kamentsa.jpg',
        fileType: 'image',
        mimeType: 'image/jpeg',
        size: 350000,
        lesson: lessons.find(l => l.title === 'Artesanía y Vestimenta') || null,
        userId: defaultUserId, // Asignar userId
      },
      {
        fileName: 'planta_medicinal.png',
        filePath: '/uploads/images/planta_medicinal.png',
        fileType: 'image',
        mimeType: 'image/png',
        size: 280000,
        lesson: lessons.find(l => l.title === 'Comida y Naturaleza') || null,
        userId: defaultUserId, // Asignar userId
      },

      // Videos
      {
        fileName: 'saludo_tradicional.mp4',
        filePath: '/uploads/videos/saludo_tradicional.mp4',
        fileType: 'video',
        mimeType: 'video/mp4',
        size: 8000000,
        lesson: lessons.find(l => l.title === 'Saludos y Presentaciones') || null,
        userId: defaultUserId, // Asignar userId
      },
      {
        fileName: 'ritual_kamentsa.mov',
        filePath: '/uploads/videos/ritual_kamentsa.mov',
        fileType: 'video',
        mimeType: 'video/quicktime',
        size: 12000000,
        lesson: lessons.find(l => l.title === 'Rituales y Ceremonias') || null,
        userId: defaultUserId, // Asignar userId
      },
      {
        fileName: 'clase_fonetica.mp4',
        filePath: '/uploads/videos/clase_fonetica.mp4',
        fileType: 'video',
        mimeType: 'video/mp4',
        size: 10000000,
        lesson: lessons.find(l => l.title === 'Vocales y Consonantes') || null,
        userId: defaultUserId, // Asignar userId
      },

      // Audios
      {
        fileName: 'pronunciacion_basica.mp3',
        filePath: '/uploads/audio/pronunciacion_basica.mp3',
        fileType: 'audio',
        mimeType: 'audio/mpeg',
        size: 1500000,
        lesson: lessons.find(l => l.title === 'Fonética y Pronunciación') || null,
        userId: defaultUserId, // Asignar userId
      },
      {
        fileName: 'dialogo_cotidiano.mp3',
        filePath: '/uploads/audio/dialogo_cotidiano.mp3',
        fileType: 'audio',
        mimeType: 'audio/mpeg',
        size: 2500000,
        lesson: lessons.find(l => l.title === 'Conversación Cotidiana') || null,
        userId: defaultUserId, // Asignar userId
      },
      {
        fileName: 'cancion_tradicional.wav',
        filePath: '/uploads/audio/cancion_tradicional.wav',
        fileType: 'audio',
        mimeType: 'audio/wav',
        size: 3500000,
        lesson: lessons.find(l => l.title === 'La Música Kamëntsá') || null,
        userId: defaultUserId, // Asignar userId
      },

      // Documentos
      {
        fileName: 'gramatica_fundamental.pdf',
        filePath: '/uploads/documents/gramatica_fundamental.pdf',
        fileType: 'document',
        mimeType: 'application/pdf',
        size: 1500000,
        lesson: lessons.find(l => l.title === 'Gramática Fundamental') || null,
        userId: defaultUserId, // Asignar userId
      },
      {
        fileName: 'cuento_corto.pdf',
        filePath: '/uploads/documents/cuento_corto.pdf',
        fileType: 'document',
        mimeType: 'application/pdf',
        size: 800000,
        lesson: lessons.find(l => l.title === 'Textos Sencillos') || null,
        userId: defaultUserId, // Asignar userId
      },
       {
        fileName: 'lista_verbos.pdf',
        filePath: '/uploads/documents/lista_verbos.pdf',
        fileType: 'document',
        mimeType: 'application/pdf',
        size: 1200000,
        lesson: lessons.find(l => l.title === 'Tiempos Verbales Básicos') || null,
        userId: defaultUserId, // Asignar userId
      },
    ];

    // Eliminar multimedia existente para evitar duplicados en cada ejecución del seeder
    const existingMultimedia = await multimediaRepository.find();
    if (existingMultimedia.length > 0) {
      await multimediaRepository.remove(existingMultimedia);
    }

    await multimediaRepository.save(multimediaData);

    console.log('Multimedia seeder finished.');
  }
}
