import {
    Entity,
    PrimaryColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    JoinColumn
} from 'typeorm';
import { Status } from '../../../common/enums/status.enum';
import { ChangeType } from '../enums/change-type.enum'; // Asumo que existe o se creará este enum
import { Content } from '../../content/entities/content.entity'; // Asumo que existe la entidad Content
import { User } from '../../../auth/entities/user.entity'; // Asumo que existe la entidad User
import { v4 as uuidv4 } from 'uuid';

@Entity('content_versions')
export class ContentVersion {
    @PrimaryColumn('uuid', { default: uuidv4() })
    id: string;

    @Column({ type: 'uuid' })
    contentId: string;

    @ManyToOne(() => Content, content => content.versions)
    @JoinColumn({ name: 'contentId' })
    content: Content; // Relación con la entidad Content

    @Column({ type: 'jsonb' })
    contentData: any; // Contenido real de la versión

    @Column({ type: 'int' })
    majorVersion: number;

    @Column({ type: 'int' })
    minorVersion: number;

    @Column({ type: 'int' })
    patchVersion: number;

    @Column({ type: 'enum', enum: Status })
    status: Status;

    @Column({ type: 'enum', enum: ChangeType })
    changeType: ChangeType;

    @Column({ type: 'jsonb', nullable: true })
    metadata: any; // Metadatos adicionales (autor, etc.)

    @Column({ type: 'jsonb', nullable: true })
    validationStatus: any; // Estado de validación (score, etc.)

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    // Posible relación con el autor si se almacena en metadata
    // @ManyToOne(() => User)
    // @JoinColumn({ name: 'authorId' }) // Asumiendo que authorId está en metadata
    // author: User;
}
