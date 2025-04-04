import { MigrationInterface, QueryRunner } from "typeorm";

export class AddPreferencesColumnToUsers1743793100000 implements MigrationInterface {
    public name = 'AddPreferencesColumnToUsers1743793100000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ADD "preferences" jsonb NOT NULL DEFAULT '{}'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "preferences"`);
    }
}
