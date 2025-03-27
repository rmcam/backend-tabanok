import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateCulturalContentCategory1711558900000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // Primero establecemos un valor por defecto para los registros existentes
        await queryRunner.query(`
            UPDATE cultural_content 
            SET category = 'general' 
            WHERE category IS NULL
        `);

        // Luego modificamos la columna para que no acepte nulos
        await queryRunner.query(`
            ALTER TABLE cultural_content 
            ALTER COLUMN category SET NOT NULL
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE cultural_content 
            ALTER COLUMN category DROP NOT NULL
        `);
    }
} 