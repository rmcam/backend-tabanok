
 import { Column, CreateDateColumn, Entity, JoinTable, ManyToMany, UpdateDateColumn } from 'typeorm';
import { BaseAchievement } from './base-achievement.entity';
import { User } from '../../../auth/entities/user.entity';

export enum AchievementCategory {
    LENGUA = 'lengua',
    DANZA = 'danza',
    MUSICA = 'musica',
    ARTESANIA = 'artesania',
    HISTORIA = 'historia',
    TRADICION = 'tradicion',
    GASTRONOMIA = 'gastronomia',
    MEDICINA = 'medicina',
    RITUALES = 'rituales',
    MITOS_LEYENDAS = 'mitos_leyendas'
}

export enum AchievementType {
    APRENDIZAJE_CULTURAL = 'aprendizaje_cultural',
    EXPLORACION_CONTENIDO = 'exploracion_contenido',
    PARTICIPACION_EVENTO = 'participacion_evento', // Logro por participar en un evento cultural.
    CREACION_CONTENIDO = 'creacion_contenido', // Logro por crear contenido cultural.
    CONTRIBUCION_CULTURAL = 'contribucion_cultural', // Logro por realizar una contribución cultural.
    APRENDIZAJE_LENGUA = 'aprendizaje_lengua', // Logro por aprender la lengua.
    DOMINIO_CULTURAL = 'dominio_cultural' // Logro por demostrar dominio cultural.
}

export enum AchievementTier {
    BRONCE = 'bronce',
    PLATA = 'plata',
    ORO = 'oro',
    PLATINO = 'platino',
    ANCESTRAL = 'ancestral'
}

@Entity('cultural_achievements')
export class CulturalAchievement extends BaseAchievement {
    @Column({
        type: 'enum',
        enum: AchievementCategory
    })
    category: AchievementCategory;

    @Column({
        type: 'enum',
        enum: AchievementType,
        default: AchievementType.CONTRIBUCION_CULTURAL
    })
    type: AchievementType;

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

    @Column('int', { nullable: true })
    expirationDays?: number;

    @Column('json', { nullable: true })
    additionalRewards?: {
        type: string;
        value: any;
        description: string;
    }[];

    @Column({ default: true })
    isActive: boolean;

    @Column({ default: false })
    isSecret: boolean;



    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
