import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ContentVersion } from '../../content-versioning/entities/content-version.entity';
import { ChangeType, ContentStatus } from '../../content-versioning/interfaces/content-version.interface';

@Injectable()
export class ContentVersionSeeder {
    constructor(
        @InjectRepository(ContentVersion)
        private readonly versionRepository: Repository<ContentVersion>
    ) { }

    async seed() {
        const versions: Partial<ContentVersion>[] = [
            {
                id: '1',
                contentId: '1',
                versionNumber: 1,
                majorVersion: 1,
                minorVersion: 0,
                patchVersion: 0,
                content: {
                    original: 'Namui wam es una lengua ancestral que refleja nuestra conexión con la tierra.',
                    translated: 'Namui wam is an ancestral language that reflects our connection with the land.',
                    culturalContext: 'Namui wam es la lengua del pueblo Misak. Es fundamental para la transmisión de conocimientos ancestrales y la preservación de nuestra identidad cultural. A través de ella expresamos nuestra relación con el territorio y la naturaleza.',
                    pronunciation: 'na-mwi wam',
                    dialectVariation: 'Guambiano central'
                },
                metadata: {
                    tags: ['lengua', 'identidad', 'cultura', 'territorio'],
                    author: 'María Chaves',
                    reviewers: ['Juan Tunubala', 'Pedro Almendra'],
                    validatedBy: 'Consejo de Mayores'
                },
                status: ContentStatus.PUBLISHED,
                changeType: ChangeType.CREATION,
                changes: [],
                validationStatus: {
                    culturalAccuracy: 0.95,
                    linguisticQuality: 0.9,
                    communityApproval: true
                },
                isLatest: true,
                hasConflicts: false,
                relatedVersions: [],
                changelog: [{
                    date: new Date(),
                    author: 'María Chaves',
                    description: 'Creación inicial del contenido',
                    type: ChangeType.CREATION
                }]
            },
            {
                id: '2',
                contentId: '2',
                versionNumber: 1,
                majorVersion: 1,
                minorVersion: 0,
                patchVersion: 0,
                content: {
                    original: 'Pi srø srø.',
                    translated: 'Good morning.',
                    culturalContext: 'Saludo tradicional Misak usado en las primeras horas de la mañana.',
                    pronunciation: 'pi srø srø',
                    dialectVariation: 'Guambiano central'
                },
                metadata: {
                    tags: ['saludo', 'cotidiano', 'mañana'],
                    author: 'Carlos Morales',
                    reviewers: ['Ana Tunubala'],
                    validatedBy: 'Comité Lingüístico'
                },
                status: ContentStatus.PUBLISHED,
                changeType: ChangeType.CREATION,
                changes: [],
                validationStatus: {
                    culturalAccuracy: 0.85,
                    linguisticQuality: 0.9,
                    communityApproval: true
                },
                isLatest: true,
                hasConflicts: false,
                relatedVersions: [],
                changelog: [{
                    date: new Date(),
                    author: 'Carlos Morales',
                    description: 'Creación inicial del contenido',
                    type: ChangeType.CREATION
                }]
            },
            {
                id: '3',
                contentId: '3',
                versionNumber: 1,
                majorVersion: 1,
                minorVersion: 0,
                patchVersion: 0,
                content: {
                    original: 'Misak Misak waruntø katik.',
                    translated: '',
                    culturalContext: 'Concepto relacionado con la identidad Misak.',
                    pronunciation: 'mi-sak mi-sak wa-run-tø ka-tik',
                    dialectVariation: 'Guambiano norte'
                },
                metadata: {
                    tags: ['identidad', 'cultura'],
                    author: 'Luis Almendra',
                    reviewers: [],
                    validatedBy: null
                },
                status: ContentStatus.DRAFT,
                changeType: ChangeType.CREATION,
                changes: [],
                validationStatus: {
                    culturalAccuracy: 0.7,
                    linguisticQuality: 0.6,
                    communityApproval: false
                },
                isLatest: true,
                hasConflicts: false,
                relatedVersions: [],
                changelog: [{
                    date: new Date(),
                    author: 'Luis Almendra',
                    description: 'Creación inicial del contenido',
                    type: ChangeType.CREATION
                }]
            }
        ];

        for (const version of versions) {
            const exists = await this.versionRepository.findOne({
                where: { id: version.id }
            });

            if (!exists) {
                await this.versionRepository.save(version);
            }
        }

        console.log('Datos de prueba generados exitosamente');
    }
} 