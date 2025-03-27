import { MigrationInterface, QueryRunner } from "typeorm";

export class AddContentColumn1711558900002 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // Primero agregamos la columna permitiendo nulos
        await queryRunner.query(`
            ALTER TABLE cultural_content 
            ADD COLUMN content text NULL
        `);

        // Actualizamos los registros existentes con un valor por defecto
        await queryRunner.query(`
            UPDATE cultural_content 
            SET content = description 
            WHERE content IS NULL
        `);

        // Finalmente, hacemos la columna NOT NULL
        await queryRunner.query(`
            ALTER TABLE cultural_content 
            ALTER COLUMN content SET NOT NULL
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE cultural_content 
            DROP COLUMN content
        `);
    }
} 