import { Column, CreateDateColumn, Entity, ManyToOne, OneToMany, PrimaryColumn, UpdateDateColumn } from 'typeorm'; // Importar OneToMany
import { Unity } from '../../unity/entities/unity.entity';
import { Exercise } from '../../exercises/entities/exercise.entity'; // Importar Exercise
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

    @OneToMany(() => Exercise, exercise => exercise.topic) // Añadir esta relación
    exercises: Exercise[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
