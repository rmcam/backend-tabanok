import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateActivityDescription1709853742001 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // Primero, actualizamos los registros existentes
        await queryRunner.query(`
            UPDATE activity 
            SET description = 'Sin descripción' 
            WHERE description IS NULL
        `);

        // Luego, hacemos la columna NOT NULL
        await queryRunner.query(`
            ALTER TABLE activity 
            ALTER COLUMN description SET NOT NULL
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE activity 
            ALTER COLUMN description DROP NOT NULL
        `);
    }
} 