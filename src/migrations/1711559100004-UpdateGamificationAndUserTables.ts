import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateGamificationAndUserTables1711559100004 implements MigrationInterface {
    name = 'UpdateGamificationAndUserTables1711559100004'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Actualizar tabla de usuarios
        await queryRunner.query(`
            ALTER TABLE "users" 
            ADD COLUMN IF NOT EXISTS "username" character varying,
            ADD COLUMN IF NOT EXISTS "avatar" character varying,
            ADD COLUMN IF NOT EXISTS "profile" jsonb DEFAULT '{}',
            ADD COLUMN IF NOT EXISTS "roles" text[] DEFAULT '{}'
        `);

        // Actualizar tabla de gamificación
        await queryRunner.query(`
            ALTER TABLE "gamification"
            ADD COLUMN IF NOT EXISTS "stats" jsonb DEFAULT '{"lessonsCompleted": 0, "exercisesCompleted": 0, "perfectScores": 0, "learningStreak": 0, "lastActivityDate": null, "culturalContributions": 0}'
        `);

        // Crear tabla de relación gamification_missions
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "gamification_missions" (
                "gamification_id" uuid NOT NULL,
                "mission_id" uuid NOT NULL,
                CONSTRAINT "PK_gamification_missions" PRIMARY KEY ("gamification_id", "mission_id")
            )
        `);

        // Agregar índices y claves foráneas
        await queryRunner.query(`
            CREATE INDEX IF NOT EXISTS "IDX_gamification_missions_gamification" ON "gamification_missions" ("gamification_id")
        `);
        await queryRunner.query(`
            CREATE INDEX IF NOT EXISTS "IDX_gamification_missions_mission" ON "gamification_missions" ("mission_id")
        `);

        await queryRunner.query(`
            ALTER TABLE "gamification_missions"
            ADD CONSTRAINT "FK_gamification_missions_gamification"
            FOREIGN KEY ("gamification_id")
            REFERENCES "gamification"("id")
            ON DELETE CASCADE
            ON UPDATE CASCADE
        `);

    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Eliminar relaciones y tabla de gamification_missions
        await queryRunner.query(`
            ALTER TABLE "gamification_missions" DROP CONSTRAINT "FK_gamification_missions_mission"
        `);
        await queryRunner.query(`
            ALTER TABLE "gamification_missions" DROP CONSTRAINT "FK_gamification_missions_gamification"
        `);
        await queryRunner.query(`DROP INDEX "IDX_gamification_missions_mission"`);
        await queryRunner.query(`DROP INDEX "IDX_gamification_missions_gamification"`);
        await queryRunner.query(`DROP TABLE "gamification_missions"`);

        // Revertir cambios en tabla de gamificación
        await queryRunner.query(`
            ALTER TABLE "gamification" DROP COLUMN "stats"
        `);

        // Revertir cambios en tabla de usuarios
        await queryRunner.query(`
            ALTER TABLE "users"
            DROP COLUMN "username",
            DROP COLUMN "avatar",
            DROP COLUMN "profile",
            DROP COLUMN "roles"
        `);
    }
}
