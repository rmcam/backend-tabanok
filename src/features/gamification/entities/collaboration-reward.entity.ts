import { Column, Entity, PrimaryColumn, OneToOne, JoinColumn } from 'typeorm';
import { Badge } from './badge.entity'; // Importar la entidad Badge
import { v4 as uuidv4 } from 'uuid';

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
    @PrimaryColumn('uuid', { default: uuidv4() })
    id: string;

    @OneToOne(() => Badge, { nullable: true }) // Relación OneToOne con Badge
    @JoinColumn() // Columna para la clave foránea
    specialBadge: Badge; // Propiedad para la insignia especial

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
