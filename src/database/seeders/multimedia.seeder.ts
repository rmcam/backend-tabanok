import { DataSource } from 'typeorm';
import { DataSourceAwareSeed } from './index';
import { Multimedia } from '../../features/multimedia/entities/multimedia.entity';
import { Lesson } from '../../features/lesson/entities/lesson.entity';

export class MultimediaSeeder extends DataSourceAwareSeed {
  constructor(dataSource: DataSource) {
    super(dataSource);
  }

  async run(): Promise<void> {
    const multimediaRepository = this.dataSource.getRepository(Multimedia);
    const lessonRepository = this.dataSource.getRepository(Lesson);

    // Obtener todas las lecciones existentes para asociar multimedia
    const lessons = await lessonRepository.find();

    const multimediaData = [
      // Imágenes
      {
        fileName: 'alfabeto_kamentsa.jpg',
        filePath: '/uploads/images/alfabeto_kamentsa.jpg',
        fileType: 'image',
        mimeType: 'image/jpeg',
        size: 200000,
        lesson: lessons.find(l => l.title === 'Bienvenida y Alfabeto') || null,
      },
      {
        fileName: 'familia_tradicional.png',
        filePath: '/uploads/images/familia_tradicional.png',
        fileType: 'image',
        mimeType: 'image/png',
        size: 300000,
        lesson: lessons.find(l => l.title === 'Familia y Comunidad') || null,
      },
      {
        fileName: 'mapa_putumayo.jpg',
        filePath: '/uploads/images/mapa_putumayo.jpg',
        fileType: 'image',
        mimeType: 'image/jpeg',
        size: 400000,
        lesson: lessons.find(l => l.title === 'Historia del Pueblo Kamëntsá') || null,
      },
      {
        fileName: 'artesania_kamentsa.jpg',
        filePath: '/uploads/images/artesania_kamentsa.jpg',
        fileType: 'image',
        mimeType: 'image/jpeg',
        size: 350000,
        lesson: lessons.find(l => l.title === 'Artesanía y Vestimenta') || null,
      },
      {
        fileName: 'planta_medicinal.png',
        filePath: '/uploads/images/planta_medicinal.png',
        fileType: 'image',
        mimeType: 'image/png',
        size: 280000,
        lesson: lessons.find(l => l.title === 'Comida y Naturaleza') || null,
      },

      // Videos
      {
        fileName: 'saludo_tradicional.mp4',
        filePath: '/uploads/videos/saludo_tradicional.mp4',
        fileType: 'video',
        mimeType: 'video/mp4',
        size: 8000000,
        lesson: lessons.find(l => l.title === 'Saludos y Presentaciones') || null,
      },
      {
        fileName: 'ritual_kamentsa.mov',
        filePath: '/uploads/videos/ritual_kamentsa.mov',
        fileType: 'video',
        mimeType: 'video/quicktime',
        size: 12000000,
        lesson: lessons.find(l => l.title === 'Rituales y Ceremonias') || null,
      },
      {
        fileName: 'clase_fonetica.mp4',
        filePath: '/uploads/videos/clase_fonetica.mp4',
        fileType: 'video',
        mimeType: 'video/mp4',
        size: 10000000,
        lesson: lessons.find(l => l.title === 'Vocales y Consonantes') || null,
      },

      // Audios
      {
        fileName: 'pronunciacion_basica.mp3',
        filePath: '/uploads/audio/pronunciacion_basica.mp3',
        fileType: 'audio',
        mimeType: 'audio/mpeg',
        size: 1500000,
        lesson: lessons.find(l => l.title === 'Fonética y Pronunciación') || null,
      },
      {
        fileName: 'dialogo_cotidiano.mp3',
        filePath: '/uploads/audio/dialogo_cotidiano.mp3',
        fileType: 'audio',
        mimeType: 'audio/mpeg',
        size: 2500000,
        lesson: lessons.find(l => l.title === 'Conversación Cotidiana') || null,
      },
      {
        fileName: 'cancion_tradicional.wav',
        filePath: '/uploads/audio/cancion_tradicional.wav',
        fileType: 'audio',
        mimeType: 'audio/wav',
        size: 3500000,
        lesson: lessons.find(l => l.title === 'La Música Kamëntsá') || null,
      },

      // Documentos
      {
        fileName: 'gramatica_fundamental.pdf',
        filePath: '/uploads/documents/gramatica_fundamental.pdf',
        fileType: 'document',
        mimeType: 'application/pdf',
        size: 1500000,
        lesson: lessons.find(l => l.title === 'Gramática Fundamental') || null,
      },
      {
        fileName: 'cuento_corto.pdf',
        filePath: '/uploads/documents/cuento_corto.pdf',
        fileType: 'document',
        mimeType: 'application/pdf',
        size: 800000,
        lesson: lessons.find(l => l.title === 'Textos Sencillos') || null,
      },
       {
        fileName: 'lista_verbos.pdf',
        filePath: '/uploads/documents/lista_verbos.pdf',
        fileType: 'document',
        mimeType: 'application/pdf',
        size: 1200000,
        lesson: lessons.find(l => l.title === 'Tiempos Verbales Básicos') || null,
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
