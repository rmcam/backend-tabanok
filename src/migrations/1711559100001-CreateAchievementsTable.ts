import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateAchievementsTable1711559100001 implements MigrationInterface {
    name = 'CreateAchievementsTable1711559100001'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Crear el enum para los tipos de logros
        await queryRunner.query(`
            CREATE TYPE achievement_type_enum AS ENUM (
                'LEVEL_REACHED',
                'LESSONS_COMPLETED',
                'PERFECT_SCORES',
                'STREAK_MAINTAINED',
                'CULTURAL_CONTRIBUTIONS',
                'POINTS_EARNED'
            )
        `);

        // Crear la tabla de logros
        await queryRunner.query(`
            CREATE TABLE "achievements" (
                "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
                "name" character varying NOT NULL,
                "description" character varying NOT NULL,
                "type" achievement_type_enum NOT NULL,
                "requirement" integer NOT NULL,
                "bonusPoints" integer NOT NULL,
                "badge" jsonb,
                "isSecret" boolean NOT NULL DEFAULT false,
                "tiers" jsonb,
                "unlockedBy" jsonb DEFAULT '[]',
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now()
            )
        `);

        // Crear la tabla de relación entre usuarios y logros
        await queryRunner.query(`
            CREATE TABLE "gamification_achievements" (
                "gamificationId" uuid NOT NULL,
                "achievementId" uuid NOT NULL,
                CONSTRAINT "PK_gamification_achievements" PRIMARY KEY ("gamificationId", "achievementId"),
                CONSTRAINT "FK_gamification_achievements_gamification" FOREIGN KEY ("gamificationId") REFERENCES "gamification"("id") ON DELETE CASCADE,
                CONSTRAINT "FK_gamification_achievements_achievements" FOREIGN KEY ("achievementId") REFERENCES "achievements"("id") ON DELETE CASCADE
            )
        `);

        // Crear índices
        await queryRunner.query(`
            CREATE INDEX "IDX_achievements_type" ON "achievements"("type");
            CREATE INDEX "IDX_achievements_isSecret" ON "achievements"("isSecret");
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Eliminar índices
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_achievements_isSecret"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_achievements_type"`);

        // Eliminar tablas
        await queryRunner.query(`DROP TABLE IF EXISTS "gamification_achievements"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "achievements"`);

        // Eliminar enum
        await queryRunner.query(`DROP TYPE IF EXISTS achievement_type_enum`);
    }
} 