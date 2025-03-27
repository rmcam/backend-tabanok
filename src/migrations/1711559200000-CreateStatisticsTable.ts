import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateStatisticsTable1711559200000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE "statistics" (
                "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
                "userId" uuid NOT NULL,
                "learningMetrics" jsonb NOT NULL DEFAULT '{
                    "totalLessonsCompleted": 0,
                    "totalExercisesCompleted": 0,
                    "averageScore": 0,
                    "totalTimeSpentMinutes": 0,
                    "longestStreak": 0,
                    "currentStreak": 0
                }',
                "progressByCategory" jsonb NOT NULL DEFAULT '{
                    "vocabulary": 0,
                    "grammar": 0,
                    "pronunciation": 0,
                    "comprehension": 0,
                    "writing": 0
                }',
                "weeklyProgress" jsonb NOT NULL DEFAULT '[]',
                "monthlyProgress" jsonb NOT NULL DEFAULT '[]',
                "achievementStats" jsonb NOT NULL DEFAULT '{
                    "totalAchievements": 0,
                    "achievementsByCategory": {},
                    "lastAchievementDate": null
                }',
                "badgeStats" jsonb NOT NULL DEFAULT '{
                    "totalBadges": 0,
                    "badgesByTier": {},
                    "lastBadgeDate": null
                }',
                "strengthAreas" jsonb NOT NULL DEFAULT '[]',
                "improvementAreas" jsonb NOT NULL DEFAULT '[]',
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "fk_statistics_user" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE
            )
        `);

        // Crear índices
        await queryRunner.query(`
            CREATE INDEX "idx_statistics_userId" ON "statistics"("userId");
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Eliminar índices
        await queryRunner.query(`
            DROP INDEX IF EXISTS "idx_statistics_userId";
        `);

        // Eliminar tabla
        await queryRunner.query(`DROP TABLE IF EXISTS "statistics"`);
    }
} 