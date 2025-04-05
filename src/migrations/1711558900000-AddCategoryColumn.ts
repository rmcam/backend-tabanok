import { MigrationInterface, QueryRunner } from "typeorm";

export class AddCategoryColumn1711558900000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // Agregar la columna category permitiendo nulos inicialmente
        await queryRunner.query(`
            ALTER TABLE cultural_content 
            ADD COLUMN category varchar NULL DEFAULT 'general'
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE cultural_content 
            DROP COLUMN category
        `);
    }
} 