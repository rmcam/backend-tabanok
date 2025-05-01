import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

export enum CollaborationType {
    CONTENIDO_CREACION = 'CONTENIDO_CREACION',
    CONTENIDO_REVISION = 'CONTENIDO_REVISION',
    CONTRIBUCION_CULTURAL = 'CONTRIBUCION_CULTURAL',
    CONTENIDO_TRADUCCION = 'CONTENIDO_TRADUCCION',
    AYUDA_COMUNITARIA = 'AYUDA_COMUNITARIA',
    REPORTE_ERRORES = 'REPORTE_ERRORES'
}

@Entity('collaboration_rewards')
export class CollaborationReward {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({
        type: 'enum',
        enum: CollaborationType
    })
    type: CollaborationType;

    @Column()
    title: string;

    @Column()
    description: string;

    @Column('int')
    basePoints: number;

    @Column('jsonb')
    qualityMultipliers: {
        excellent: number;
        good: number;
        average: number;
    };

    @Column('jsonb', { nullable: true })
    specialBadge?: {
        id: string;
        name: string;
        icon: string;
        requirementCount: number; // Número de colaboraciones necesarias
        description?: string;
        category?: string;
        tier?: string;
        iconUrl?: string;
        expirationDate?: Date;
    };

    @Column('jsonb')
    history: Array<{
        userId: string;
        contributionId: string;
        type: CollaborationType;
        quality: string; // Permitir cualquier string para la calidad
        pointsAwarded: number;
        awardedAt: Date;
        reviewedBy?: string;
    }>;

    @Column('jsonb')
    streakBonuses: {
        threshold: number; // Número de días consecutivos
        multiplier: number;
    }[];
}
