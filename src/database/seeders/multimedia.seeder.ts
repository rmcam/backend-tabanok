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

    // Obtener más lecciones existentes para asociar multimedia
    const lessons = await lessonRepository.find({ take: 10 }); // Obtener las primeras 10 lecciones

    const multimediaData = [
      {
        fileName: 'imagen_ejemplo_1.jpg',
        filePath: '/uploads/images/imagen_ejemplo_1.jpg',
        fileType: 'image',
        mimeType: 'image/jpeg',
        size: 150000,
        lesson: lessons[0] || null, // Asociar a la primera lección si existe
      },
      {
        fileName: 'video_ejemplo_1.mp4',
        filePath: '/uploads/videos/video_ejemplo_1.mp4',
        fileType: 'video',
        mimeType: 'video/mp4',
        size: 5000000,
        lesson: lessons[1] || null, // Asociar a la segunda lección si existe
      },
      {
        fileName: 'audio_ejemplo_1.mp3',
        filePath: '/uploads/audio/audio_ejemplo_1.mp3',
        fileType: 'audio',
        mimeType: 'audio/mpeg',
        size: 2000000,
        lesson: lessons[0] || null, // Asociar a la primera lección si existe
      },
      {
        fileName: 'imagen_ejemplo_2.png',
        filePath: '/uploads/images/imagen_ejemplo_2.png',
        fileType: 'image',
        mimeType: 'image/png',
        size: 250000,
        lesson: lessons[2] || null, // Asociar a la tercera lección si existe
      },
      {
        fileName: 'documento_ejemplo_1.pdf',
        filePath: '/uploads/documents/documento_ejemplo_1.pdf',
        fileType: 'document',
        mimeType: 'application/pdf',
        size: 1000000,
        lesson: lessons[3] || null, // Asociar a la cuarta lección si existe
      },
      {
        fileName: 'audio_ejemplo_2.wav',
        filePath: '/uploads/audio/audio_ejemplo_2.wav',
        fileType: 'audio',
        mimeType: 'audio/wav',
        size: 3000000,
        lesson: lessons[1] || null, // Asociar a la segunda lección si existe
      },
      {
        fileName: 'video_ejemplo_2.mov',
        filePath: '/uploads/videos/video_ejemplo_2.mov',
        fileType: 'video',
        mimeType: 'video/quicktime',
        size: 7000000,
        lesson: lessons[4] || null, // Asociar a la quinta lección si existe
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
