import { MigrationInterface, QueryRunner } from "typeorm";
import { CategoryDifficulty, CategoryStatus, CategoryType } from "../features/statistics/interfaces/category.interface";

export class UpdateStatisticsWithCategories1711559300000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // Crear estructura inicial de categoryMetrics para cada categoría
        const initialCategoryMetrics = {
            [CategoryType.VOCABULARY]: {
                type: CategoryType.VOCABULARY,
                difficulty: CategoryDifficulty.BEGINNER,
                status: CategoryStatus.AVAILABLE,
                progress: {
                    totalExercises: 0,
                    completedExercises: 0,
                    averageScore: 0,
                    timeSpentMinutes: 0,
                    lastPracticed: null,
                    masteryLevel: 0,
                    streak: 0
                },
                prerequisites: [],
                unlockRequirements: {
                    requiredScore: 0,
                    requiredCategories: []
                },
                subCategories: ['sustantivos', 'verbos', 'adjetivos', 'frases_comunes']
            },
            [CategoryType.GRAMMAR]: {
                type: CategoryType.GRAMMAR,
                difficulty: CategoryDifficulty.BEGINNER,
                status: CategoryStatus.LOCKED,
                progress: {
                    totalExercises: 0,
                    completedExercises: 0,
                    averageScore: 0,
                    timeSpentMinutes: 0,
                    lastPracticed: null,
                    masteryLevel: 0,
                    streak: 0
                },
                prerequisites: [CategoryType.VOCABULARY],
                unlockRequirements: {
                    requiredScore: 70,
                    requiredCategories: [CategoryType.VOCABULARY]
                },
                subCategories: ['tiempos_verbales', 'pronombres', 'preposiciones']
            },
            [CategoryType.PRONUNCIATION]: {
                type: CategoryType.PRONUNCIATION,
                difficulty: CategoryDifficulty.BEGINNER,
                status: CategoryStatus.AVAILABLE,
                progress: {
                    totalExercises: 0,
                    completedExercises: 0,
                    averageScore: 0,
                    timeSpentMinutes: 0,
                    lastPracticed: null,
                    masteryLevel: 0,
                    streak: 0
                },
                prerequisites: [],
                unlockRequirements: {
                    requiredScore: 0,
                    requiredCategories: []
                },
                subCategories: ['vocales', 'consonantes', 'entonacion']
            },
            [CategoryType.COMPREHENSION]: {
                type: CategoryType.COMPREHENSION,
                difficulty: CategoryDifficulty.INTERMEDIATE,
                status: CategoryStatus.LOCKED,
                progress: {
                    totalExercises: 0,
                    completedExercises: 0,
                    averageScore: 0,
                    timeSpentMinutes: 0,
                    lastPracticed: null,
                    masteryLevel: 0,
                    streak: 0
                },
                prerequisites: [CategoryType.VOCABULARY, CategoryType.GRAMMAR],
                unlockRequirements: {
                    requiredScore: 75,
                    requiredCategories: [CategoryType.VOCABULARY, CategoryType.GRAMMAR]
                },
                subCategories: ['lectura', 'audio', 'contexto']
            },
            [CategoryType.WRITING]: {
                type: CategoryType.WRITING,
                difficulty: CategoryDifficulty.ADVANCED,
                status: CategoryStatus.LOCKED,
                progress: {
                    totalExercises: 0,
                    completedExercises: 0,
                    averageScore: 0,
                    timeSpentMinutes: 0,
                    lastPracticed: null,
                    masteryLevel: 0,
                    streak: 0
                },
                prerequisites: [CategoryType.VOCABULARY, CategoryType.GRAMMAR, CategoryType.COMPREHENSION],
                unlockRequirements: {
                    requiredScore: 80,
                    requiredCategories: [CategoryType.VOCABULARY, CategoryType.GRAMMAR, CategoryType.COMPREHENSION]
                },
                subCategories: ['oraciones', 'parrafos', 'textos']
            }
        };

        // Actualizar la estructura de la tabla statistics
        await queryRunner.query(`
            ALTER TABLE "statistics"
            ADD COLUMN IF NOT EXISTS "categoryMetrics" jsonb NOT NULL DEFAULT '${JSON.stringify(initialCategoryMetrics)}',
            ADD COLUMN IF NOT EXISTS "learningPath" jsonb NOT NULL DEFAULT '{
                "currentLevel": 1,
                "recommendedCategories": ["vocabulary", "pronunciation"],
                "nextMilestones": [],
                "customGoals": []
            }'::jsonb;

            -- Actualizar learningMetrics para incluir nuevos campos
            UPDATE "statistics"
            SET "learningMetrics" = "learningMetrics" || '{
                "lastActivityDate": null,
                "totalMasteryScore": 0
            }'::jsonb;

            -- Actualizar achievementStats para usar CategoryType
            UPDATE "statistics"
            SET "achievementStats" = "achievementStats" || '{
                "specialAchievements": []
            }'::jsonb;

            -- Actualizar badgeStats para incluir insignias activas
            UPDATE "statistics"
            SET "badgeStats" = "badgeStats" || '{
                "activeBadges": []
            }'::jsonb;

            -- Actualizar áreas para incluir tendencia y recomendaciones
            UPDATE "statistics"
            SET 
                "strengthAreas" = COALESCE(
                    (SELECT json_agg(
                        json_build_object(
                            'category', elem->>'category',
                            'score', (elem->>'score')::numeric,
                            'lastUpdated', elem->>'lastUpdated',
                            'trend', 'stable',
                            'recommendations', '[]'::jsonb
                        )
                    )
                    FROM json_array_elements("strengthAreas") elem),
                    '[]'::json
                ),
                "improvementAreas" = COALESCE(
                    (SELECT json_agg(
                        json_build_object(
                            'category', elem->>'category',
                            'score', (elem->>'score')::numeric,
                            'lastUpdated', elem->>'lastUpdated',
                            'trend', 'stable',
                            'recommendations', '[]'::jsonb
                        )
                    )
                    FROM json_array_elements("improvementAreas") elem),
                    '[]'::json
                );
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "statistics"
            DROP COLUMN IF EXISTS "categoryMetrics",
            DROP COLUMN IF EXISTS "learningPath";

            -- Revertir cambios en learningMetrics
            UPDATE "statistics"
            SET "learningMetrics" = "learningMetrics" - 'lastActivityDate' - 'totalMasteryScore';

            -- Revertir cambios en achievementStats
            UPDATE "statistics"
            SET "achievementStats" = "achievementStats" - 'specialAchievements';

            -- Revertir cambios en badgeStats
            UPDATE "statistics"
            SET "badgeStats" = "badgeStats" - 'activeBadges';

            -- Revertir cambios en áreas
            UPDATE "statistics"
            SET 
                "strengthAreas" = COALESCE(
                    (SELECT json_agg(
                        json_build_object(
                            'category', elem->>'category',
                            'score', (elem->>'score')::numeric,
                            'lastUpdated', elem->>'lastUpdated'
                        )
                    )
                    FROM json_array_elements("strengthAreas") elem),
                    '[]'::json
                ),
                "improvementAreas" = COALESCE(
                    (SELECT json_agg(
                        json_build_object(
                            'category', elem->>'category',
                            'score', (elem->>'score')::numeric,
                            'lastUpdated', elem->>'lastUpdated'
                        )
                    )
                    FROM json_array_elements("improvementAreas") elem),
                    '[]'::json
                );
        `);
    }
} 