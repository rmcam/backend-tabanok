import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateStatisticsWithCategories1711559300000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // Agregar las nuevas columnas con valores por defecto
        await queryRunner.query(`
            ALTER TABLE "statistics"
            ADD COLUMN IF NOT EXISTS "categoryMetrics" jsonb NOT NULL DEFAULT '${JSON.stringify({
            vocabulary: {
                type: "vocabulary",
                difficulty: "BEGINNER",
                status: "AVAILABLE",
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
                subCategories: ["sustantivos", "verbos", "adjetivos", "frases_comunes"]
            }
        })}',
            ADD COLUMN IF NOT EXISTS "learningPath" jsonb NOT NULL DEFAULT '{
                "currentLevel": 1,
                "recommendedCategories": ["vocabulary", "pronunciation"],
                "nextMilestones": [],
                "customGoals": []
            }'::jsonb;
        `);

        // Actualizar los campos existentes con nuevos valores por defecto
        await queryRunner.query(`
            UPDATE "statistics"
            SET 
                "learningMetrics" = COALESCE("learningMetrics", '{}') || '{"lastActivityDate": null, "totalMasteryScore": 0}'::jsonb,
                "achievementStats" = COALESCE("achievementStats", '{}') || '{"specialAchievements": []}'::jsonb,
                "badgeStats" = COALESCE("badgeStats", '{}') || '{"activeBadges": []}'::jsonb,
                "strengthAreas" = COALESCE("strengthAreas", '[]'::jsonb),
                "improvementAreas" = COALESCE("improvementAreas", '[]'::jsonb);
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "statistics"
            DROP COLUMN IF EXISTS "categoryMetrics",
            DROP COLUMN IF EXISTS "learningPath";
        `);
    }
} 