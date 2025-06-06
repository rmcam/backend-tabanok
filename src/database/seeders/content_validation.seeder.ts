import { DataSource } from 'typeorm';
import { DataSourceAwareSeed } from './data-source-aware-seed';
import { ContentValidation } from '../../features/content-validation/entities/content-validation.entity';
import { Content } from '../../features/content/entities/content.entity';
import { ContentType, ValidationStatus } from '../../features/content-validation/interfaces/content-validation.interface';
import { User } from '../../auth/entities/user.entity'; // Importar User
import { UserRole } from '../../auth/enums/auth.enum'; // Importar UserRole
import { Raw } from 'typeorm'; // Importar Raw para consultas de array

export class ContentValidationSeeder extends DataSourceAwareSeed {
    constructor(dataSource: DataSource) {
        super(dataSource);
    }

    async run(): Promise<void> {
        console.log('Running ContentValidationSeeder...');
        const contentValidationRepository = this.dataSource.getRepository(ContentValidation);
        const contentRepository = this.dataSource.getRepository(Content);
        const userRepository = this.dataSource.getRepository(User); // Obtener repositorio de User

        const contents = await contentRepository.find();
        const adminUsers = await userRepository.find({ where: { roles: Raw(alias => `${alias} @> ARRAY['${UserRole.ADMIN}']::users_roles_enum[]`) } });
        const teacherUsers = await userRepository.find({ where: { roles: Raw(alias => `${alias} @> ARRAY['${UserRole.TEACHER}']::users_roles_enum[]`) } });
        const validators = [...adminUsers, ...teacherUsers]; // Usuarios que pueden validar

        if (contents.length === 0) {
            console.warn('No contents found. Skipping ContentValidationSeeder.');
            return;
        }

        if (validators.length === 0) {
            console.warn('No admin or teacher users found to act as validators. Skipping ContentValidationSeeder.');
            return;
        }

        const contentValidationData: Partial<ContentValidation>[] = [];

        // Crear registros de validación de contenido solo en entornos que no sean producción
        if (process.env.NODE_ENV !== 'production') {
            // Limitar el número de contenidos a validar para evitar sobrecarga
            const contentsToValidate = contents.slice(0, Math.min(contents.length, 10)); // Validar hasta 10 contenidos

            for (const content of contentsToValidate) {
                // Variar el tipo de contenido y el estado de validación
                const contentType = Math.random() > 0.5 ? ContentType.SENTENCE : ContentType.WORD;
                const status = [ValidationStatus.PENDING, ValidationStatus.APPROVED, ValidationStatus.REJECTED][Math.floor(Math.random() * 3)];
                
                // Seleccionar un validador aleatorio
                const randomValidator = validators[Math.floor(Math.random() * validators.length)];

                const existingValidation = await contentValidationRepository.findOne({
                    where: { contentId: content.id.toString(), contentType: contentType }
                });

                if (!existingValidation) {
                    contentValidationData.push({
                        contentId: content.id.toString(),
                        contentType: contentType,
                        originalContent: `Contenido original de ejemplo para ID ${content.id}.`,
                        translatedContent: `Translated example content for ID ${content.id}.`,
                        status: status,
                        criteria: {
                            spelling: status === ValidationStatus.APPROVED ? true : Math.random() > 0.5,
                            grammar: status === ValidationStatus.APPROVED ? true : Math.random() > 0.5,
                            culturalAccuracy: status === ValidationStatus.APPROVED ? true : Math.random() > 0.5,
                            contextualUse: status === ValidationStatus.APPROVED ? true : Math.random() > 0.5,
                            pronunciation: status === ValidationStatus.APPROVED ? true : Math.random() > 0.5,
                        },
                        feedback: status === ValidationStatus.REJECTED ? [{
                            criteriaId: 'general_feedback', // O un ID de criterio específico si existiera
                            comment: `Feedback de validación para contenido ${content.id} por ${randomValidator.username}.`,
                            timestamp: new Date(),
                            validatorId: randomValidator.id
                        }] : [],
                        validatedBy: status === ValidationStatus.APPROVED ? [randomValidator.id] : [], // Asignar validador si está aprobado
                        submittedBy: 'system_initializer',
                        submissionDate: new Date(),
                        lastModifiedDate: new Date(),
                        validationScore: status === ValidationStatus.APPROVED ? 100 : (status === ValidationStatus.REJECTED ? 0 : 50),
                        communityVotes: {
                            upvotes: Math.floor(Math.random() * 10),
                            downvotes: Math.floor(Math.random() * 5),
                            userVotes: {},
                        },
                        dialectVariation: 'Standard',
                        culturalContext: 'General',
                        usageExamples: [],
                        relatedContent: [],
                        metadata: {
                            reviewCount: status === ValidationStatus.PENDING ? 0 : 1,
                            lastReviewDate: status !== ValidationStatus.PENDING ? new Date() : null,
                            averageReviewTime: status === ValidationStatus.PENDING ? 0 : Math.floor(Math.random() * 60),
                            validationHistory: [],
                        },
                        isUrgent: Math.random() > 0.8,
                        tags: ['seeded', 'validation'],
                    });
                } else {
                    console.log(`ContentValidation for content ID "${content.id}" and type "${contentType}" already exists. Skipping.`);
                }
            }

            await contentValidationRepository.save(contentValidationData);
            console.log(`Seeded ${contentValidationData.length} content validation records (development environment).`);
        } else {
            console.log('Skipping ContentValidationSeeder in production environment.');
        }
    }
}
