import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, ManyToMany, JoinTable, OneToMany, Unique } from 'typeorm';
import { Unity } from '../../unity/entities/unity.entity'; // Asumiendo la ruta a la entidad Unity
import { Topic } from '../../topic/entities/topic.entity'; // Asumiendo la ruta a la entidad Topic
import { Multimedia } from '../../multimedia/entities/multimedia.entity';
import { ContentVersion } from '../../content-versioning/entities/content-version.entity';

@Entity('content')
@Unique(['title', 'unityId', 'topicId'])
export class Content {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'varchar', length: 50 })
  type: string; // e.g., 'text', 'video', 'quiz'

  @Column({ type: 'jsonb', nullable: true })
  // El contenido real. La estructura de este JSON debe estar documentada
  // y ser validada en el ContentService según el 'type' del contenido.
  content?: any;

  @Column({ name: 'unity_id', type: 'uuid' })
  unityId: string;

  @ManyToOne(() => Unity)
  @JoinColumn({ name: 'unity_id' })
  unity: Unity;

  @Column({ name: 'topic_id', type: 'uuid' })
  topicId: string;

  @ManyToOne(() => Topic)
  @JoinColumn({ name: 'topic_id' })
  topic: Topic;

  @Column({ type: 'int', nullable: true })
  order?: number; // Orden dentro del tema

  @Column({ type: 'simple-array', nullable: true })
  categories?: string[];

  @Column({ type: 'simple-array', nullable: true })
  tags?: string[];

  @ManyToMany(() => Multimedia)
  @JoinTable({
    name: 'content_multimedia', // Junction table name
    joinColumn: { name: 'content_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'multimedia_id', referencedColumnName: 'id' },
  })
  multimedia: Multimedia[];

  @OneToMany(() => ContentVersion, contentVersion => contentVersion.content)
  versions: ContentVersion[];
}
