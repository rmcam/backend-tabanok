import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateGamificationTables1711559100000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // Crear tabla de logros (achievements)
        await queryRunner.query(`
            CREATE TABLE "achievement" (
                "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
                "name" varchar(100) NOT NULL,
                "description" text NOT NULL,
                "category" varchar(50) NOT NULL,
                "requiredValue" integer NOT NULL,
                "pointsReward" integer NOT NULL,
                "iconUrl" varchar(255),
                "criteria" jsonb NOT NULL DEFAULT '{}',
                "isSecret" boolean NOT NULL DEFAULT false,
                "timesAwarded" integer NOT NULL DEFAULT 0,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now()
            )
        `);

        // Crear tabla de insignias (badges)
        await queryRunner.query(`
            CREATE TABLE "badge" (
                "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
                "name" varchar(100) NOT NULL,
                "description" text NOT NULL,
                "category" varchar(50) NOT NULL,
                "tier" varchar(50) NOT NULL,
                "requiredPoints" integer NOT NULL,
                "iconUrl" varchar(255),
                "requirements" jsonb NOT NULL DEFAULT '{}',
                "isSpecial" boolean NOT NULL DEFAULT false,
                "expirationDate" date,
                "timesAwarded" integer NOT NULL DEFAULT 0,
                "benefits" jsonb NOT NULL DEFAULT '[]',
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now()
            )
        `);

        // Crear tabla de gamificación
        await queryRunner.query(`
            CREATE TABLE "gamification" (
                "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
                "userId" uuid NOT NULL,
                "points" integer NOT NULL DEFAULT 0,
                "level" integer NOT NULL DEFAULT 1,
                "experience" integer NOT NULL DEFAULT 0,
                "nextLevelExperience" integer NOT NULL DEFAULT 100,
                "achievements" jsonb NOT NULL DEFAULT '[]',
                "badges" jsonb NOT NULL DEFAULT '[]',
                "stats" jsonb NOT NULL DEFAULT '{"lessonsCompleted": 0, "exercisesCompleted": 0, "perfectScores": 0, "learningStreak": 0}',
                "recentActivities" jsonb NOT NULL DEFAULT '[]',
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "fk_gamification_user" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE
            )
        `);

        // Crear índices
        await queryRunner.query(`
            CREATE INDEX "idx_gamification_userId" ON "gamification"("userId");
            CREATE INDEX "idx_achievement_category" ON "achievement"("category");
            CREATE INDEX "idx_badge_category" ON "badge"("category");
            CREATE INDEX "idx_badge_tier" ON "badge"("tier");
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Eliminar índices
        await queryRunner.query(`
            DROP INDEX IF EXISTS "idx_gamification_userId";
            DROP INDEX IF EXISTS "idx_achievement_category";
            DROP INDEX IF EXISTS "idx_badge_category";
            DROP INDEX IF EXISTS "idx_badge_tier";
        `);

        // Eliminar tablas
        await queryRunner.query(`DROP TABLE IF EXISTS "gamification"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "badge"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "achievement"`);
    }
} 