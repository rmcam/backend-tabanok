import { Column, CreateDateColumn, Entity, JoinTable, ManyToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { User } from '../../../auth/entities/user.entity'; // Ruta corregida

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

    @Column('int', { nullable: true })
    expirationDays?: number;

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

    @Column({ default: 0 })
    points: number;

    @ManyToMany(() => User)
    @JoinTable({
        name: 'user_achievements',
        joinColumn: {
            name: 'achievementId',
            referencedColumnName: 'id'
        },
        inverseJoinColumn: {
            name: 'userId',
            referencedColumnName: 'id'
        }
    })
    users: User[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
