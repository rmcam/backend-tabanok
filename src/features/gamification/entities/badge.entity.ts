import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

export class BadgeRequirements {
    @ApiProperty({ description: 'IDs de logros requeridos', type: [String], required: false })
    achievements?: string[];

    @ApiProperty({ description: 'Puntos requeridos', example: 100, required: false })
    points?: number;

    @ApiProperty({ description: 'Nivel requerido', example: 5, required: false })
    level?: number;

    @ApiProperty({ description: 'Criterios personalizados', required: false })
    customCriteria?: {
        type: string;
        value: any;
    };
}

export class BadgeBenefit {
    @ApiProperty({ description: 'Tipo de beneficio', example: 'discount' })
    type: string;

    @ApiProperty({ description: 'Valor del beneficio', example: 0.1 })
    value: any;

    @ApiProperty({ description: 'Descripción del beneficio', example: '10% de descuento en la tienda' })
    description: string;
}

@Entity('badge')
export class Badge {
    @ApiProperty({ description: 'ID único de la insignia', example: 'a1b2c3d4-e5f6-7890-1234-567890abcdef' })
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ApiProperty({ description: 'Nombre de la insignia', example: 'Explorador Novato' })
    @Column({ type: 'varchar', length: 100 })
    name: string;

    @ApiProperty({ description: 'Descripción de la insignia', example: 'Otorgada por completar las primeras 5 lecciones.' })
    @Column({ type: 'text' })
    description: string;

    @ApiProperty({ description: 'Categoría de la insignia', example: 'Aprendizaje' })
    @Column({ type: 'varchar', length: 50 })
    category: string;

    @ApiProperty({ description: 'Nivel de la insignia', example: 'bronze', enum: ['bronze', 'silver', 'gold', 'platinum', 'diamond'] })
    @Column({ type: 'varchar', length: 50 })
    tier: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';

    @ApiProperty({ description: 'Puntos requeridos para obtener la insignia', example: 50 })
    @Column({ type: 'integer' })
    requiredPoints: number;

    @ApiProperty({ description: 'URL del icono de la insignia', example: 'https://example.com/icon.png', nullable: true })
    @Column({ type: 'varchar', length: 255, nullable: true })
    iconUrl: string;

    @ApiProperty({ description: 'Requisitos para obtener la insignia', type: BadgeRequirements })
    @Column({ type: 'jsonb', default: {} })
    requirements: BadgeRequirements;

    @ApiProperty({ description: 'Indica si la insignia es especial o de evento limitado', example: false })
    @Column({ type: 'boolean', default: false })
    isSpecial: boolean;

    @ApiProperty({ description: 'Fecha de expiración de la insignia (si aplica)', example: '2024-12-31T23:59:59Z', nullable: true })
    @Column({ type: 'date', nullable: true })
    expirationDate: Date;

    @ApiProperty({ description: 'Número de veces que se ha otorgado esta insignia', example: 150 })
    @Column({ type: 'integer', default: 0 })
    timesAwarded: number;

    @ApiProperty({ description: 'Beneficios asociados a la insignia', type: [BadgeBenefit] })
    @Column({ type: 'jsonb', default: [] })
    benefits: BadgeBenefit[];

    @ApiProperty({ description: 'Fecha de creación de la insignia', example: '2023-01-01T10:00:00Z' })
    @CreateDateColumn({ type: 'timestamp' })
    createdAt: Date;

    @ApiProperty({ description: 'Fecha de última actualización de la insignia', example: '2023-01-01T11:00:00Z' })
    @UpdateDateColumn({ type: 'timestamp' })
    updatedAt: Date;
}
