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

    // Obtener algunas lecciones existentes para asociar multimedia
    const lessons = await lessonRepository.find({ take: 5 }); // Obtener las primeras 5 lecciones

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
    ];

    // Eliminar multimedia existente para evitar duplicados en cada ejecución del seeder
    await multimediaRepository.clear();

    await multimediaRepository.save(multimediaData);

    console.log('Multimedia seeder finished.');
  }
}
