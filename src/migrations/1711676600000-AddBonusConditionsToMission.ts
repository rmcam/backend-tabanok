import { MigrationInterface, QueryRunner } from "typeorm";

export class AddBonusConditionsToMission1711676600000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE missions
            ADD COLUMN IF NOT EXISTS "bonusConditions" jsonb NULL;
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE missions
            DROP COLUMN IF EXISTS "bonusConditions";
        `);
    }
} 