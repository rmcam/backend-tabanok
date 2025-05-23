import {
    Column,
    CreateDateColumn,
    Entity,
    OneToMany,
    PrimaryColumn,
    UpdateDateColumn
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger'; // Importar ApiProperty
import { UserReward } from '../../gamification/entities/user-reward.entity';
import { RewardType, RewardTrigger } from '../../../common/enums/reward.enum';
import { v4 as uuidv4 } from 'uuid';

export { RewardType, RewardTrigger };

export class RewardCriteria {
    @ApiProperty({ description: 'Tipo de criterio', example: 'level' })
    type: string;

    @ApiProperty({ description: 'Valor del criterio', example: 5 })
    value: any;

    @ApiProperty({ description: 'Descripción del criterio', example: 'Alcanzar nivel 5' })
    description: string;
}

export class RewardCondition {
    @ApiProperty({ description: 'Tipo de condición', example: 'dateRange' })
    type: string;

    @ApiProperty({ description: 'Valor de la condición', example: { start: '2023-01-01', end: '2023-12-31' } })
    value: any;

    @ApiProperty({ description: 'Descripción de la condición', example: 'Disponible durante el año 2023' })
    description: string;
}

export class RewardValue {
    @ApiProperty({ description: 'Tipo de valor de recompensa', example: 'points' })
    type: string;

    @ApiProperty({ description: 'Valor de la recompensa', example: 100 })
    value: any;

    @ApiProperty({ description: 'Metadatos adicionales del valor de recompensa', required: false })
    metadata?: Record<string, any>;
}

@Entity('rewards')
export class Reward {
    @ApiProperty({ description: 'ID único de la recompensa', example: 'a1b2c3d4-e5f6-7890-1234-567890abcdef' })
    @PrimaryColumn('uuid', { default: uuidv4() })
    id: string;

    @ApiProperty({ description: 'Nombre interno de la recompensa', example: 'daily_login_bonus' })
    @Column()
    name: string;

    @ApiProperty({ description: 'Título visible de la recompensa', example: 'Bono de Inicio de Sesión Diario' })
    @Column()
    title: string;

    @ApiProperty({ description: 'Descripción detallada de la recompensa', example: 'Recompensa por iniciar sesión diariamente.' })
    @Column('text')
    description: string;

    @ApiProperty({ description: 'Tipo de recompensa', enum: RewardType, example: RewardType.POINTS })
    @Column({
        type: 'enum',
        enum: RewardType,
        default: RewardType.BADGE,
    })
    type: RewardType;

    @ApiProperty({ description: 'Disparador de la recompensa', enum: RewardTrigger, example: RewardTrigger.LEVEL_UP }) // Cambiado el ejemplo
    @Column({
        type: 'enum',
        enum: RewardTrigger,
        default: RewardTrigger.LEVEL_UP
    })
    trigger: RewardTrigger;

    @ApiProperty({ description: 'Costo en puntos para canjear la recompensa', example: 0 })
    @Column('int', { default: 0 })
    pointsCost: number;

    @ApiProperty({ description: 'Criterios para obtener la recompensa', type: [RewardCriteria], nullable: true })
    @Column({ type: 'json', nullable: true })
    criteria?: RewardCriteria[];

    @ApiProperty({ description: 'Condiciones adicionales para la recompensa', type: [RewardCondition], nullable: true })
    @Column('json', { nullable: true })
    conditions?: RewardCondition[];

    @ApiProperty({ description: 'Valor de la recompensa', type: RewardValue, nullable: true })
    @Column('json', { nullable: true })
    rewardValue?: RewardValue;

    @ApiProperty({ description: 'Indica si la recompensa es de cantidad limitada', example: false, nullable: true })
    @Column({ nullable: true })
    isLimited: boolean;

    @ApiProperty({ description: 'Cantidad limitada disponible de la recompensa', example: 100, nullable: true })
    @Column({ nullable: true })
    limitedQuantity?: number;

    @ApiProperty({ description: 'Fecha de inicio de validez de la recompensa', example: '2023-01-01T00:00:00Z', nullable: true })
    @Column({ nullable: true })
    startDate?: Date;

    @ApiProperty({ description: 'Fecha de fin de validez de la recompensa', example: '2023-12-31T23:59:59Z', nullable: true })
    @Column({ nullable: true })
    endDate?: Date;

    @ApiProperty({ description: 'Número de veces que se ha otorgado esta recompensa', example: 500 })
    @Column({ default: 0 })
    timesAwarded: number;

    @ApiProperty({ description: 'Puntos asociados a la recompensa (si es de tipo puntos)', example: 10 })
    @Column({ default: 0 })
    points: number;

    @ApiProperty({ description: 'Indica si la recompensa es secreta (no visible hasta ser obtenida)', example: false })
    @Column({ default: false })
    isSecret: boolean;

    @ApiProperty({ description: 'Indica si la recompensa está activa', example: true })
    @Column({ default: true })
    isActive: boolean;

    @ApiProperty({ description: 'Días hasta la expiración de la recompensa después de ser obtenida', example: 30, nullable: true })
    @Column({ nullable: true })
    expirationDays?: number;

    // Relación con UserReward (no necesita @ApiProperty a menos que se exponga directamente)
    @OneToMany(() => UserReward, userReward => userReward.reward)
    userRewards: UserReward[];

    @ApiProperty({ description: 'Fecha de creación de la recompensa', example: '2023-01-01T10:00:00Z' })
    @CreateDateColumn()
    createdAt: Date;

    @ApiProperty({ description: 'Fecha de última actualización de la recompensa', example: '2023-01-01T11:00:00Z' })
    @UpdateDateColumn()
    updatedAt: Date;
}
