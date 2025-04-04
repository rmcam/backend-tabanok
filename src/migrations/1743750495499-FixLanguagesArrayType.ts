import { MigrationInterface, QueryRunner } from "typeorm";

export class FixLanguagesArrayType1743750495499 implements MigrationInterface {
    name = 'FixLanguagesArrayType1743750495499'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "users"
            ADD COLUMN "languages" text[] NOT NULL DEFAULT '{}'
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "users"
            DROP COLUMN "languages"
        `);
    }
}
