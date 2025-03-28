import { Column, CreateDateColumn, Entity, ManyToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { User } from '../../../auth/entities/user.entity';

export enum AchievementCategory {
    LENGUA = 'lengua',
    DANZA = 'danza',
    MUSICA = 'musica',
    ARTESANIA = 'artesania',
    HISTORIA = 'historia',
    TRADICION = 'tradicion',
    GASTRONOMIA = 'gastronomia',
    MEDICINA = 'medicina'
}

export enum AchievementTier {
    BRONCE = 'bronce',
    PLATA = 'plata',
    ORO = 'oro',
    PLATINO = 'platino',
    ANCESTRAL = 'ancestral'
}

@Entity('cultural_achievements')
export class CulturalAchievement {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    name: string;

    @Column('text')
    description: string;

    @Column({
        type: 'enum',
        enum: AchievementCategory
    })
    category: AchievementCategory;

    @Column({
        type: 'enum',
        enum: AchievementTier
    })
    tier: AchievementTier;

    @Column('json')
    requirements: {
        type: string;
        value: number;
        description: string;
    }[];

    @Column('int')
    pointsReward: number;

    @Column('json', { nullable: true })
    additionalRewards?: {
        type: string;
        value: any;
        description: string;
    }[];

    @Column('text', { nullable: true })
    imageUrl?: string;

    @Column({ default: true })
    isActive: boolean;

    @Column({ default: false })
    isSecret: boolean;

    @ManyToMany(() => User, user => user.achievements)
    users: User[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
} 