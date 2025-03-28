import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateCulturalContentCategory1711558900000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // Actualizar registros donde category es NULL
        await queryRunner.query(`
            UPDATE cultural_content 
            SET category = 'general' 
            WHERE category IS NULL
        `);

        // Hacer la columna category NOT NULL después de asegurarnos que todos tienen un valor
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