import { Column, CreateDateColumn, Entity, ManyToOne, OneToMany, PrimaryColumn, UpdateDateColumn } from 'typeorm';
import { Unity } from '../../unity/entities/unity.entity';
import { Exercise } from '../../exercises/entities/exercise.entity';
import { Content } from '../../content/entities/content.entity'; // Importar Content
import { v4 as uuidv4 } from 'uuid';

@Entity('topics')
export class Topic {
    @PrimaryColumn('uuid', { default: uuidv4() })
    id: string;

    @Column()
    title: string;

    @Column({ nullable: true })
    description: string;

    @Column({ default: 1 })
    order: number;

    @Column({ default: false })
    isLocked: boolean;

    @Column({ default: 0 })
    requiredPoints: number;

    @Column({ default: true })
    isActive: boolean;

    @Column()
    unityId: string;

    @ManyToOne(() => Unity, unity => unity.topics)
    unity: Unity;

    @OneToMany(() => Exercise, exercise => exercise.topic)
    exercises: Exercise[];

    @OneToMany(() => Content, content => content.topic) // Añadir esta relación
    contents: Content[]; // Usar un nombre plural para la colección

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
