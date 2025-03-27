import { MigrationInterface, QueryRunner } from "typeorm";

export class AddContentAndCategoryColumns1711559000000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // Verificar si la columna category existe
        const hasCategory = await queryRunner.hasColumn("cultural_content", "category");
        if (!hasCategory) {
            // Agregar columna category como nullable primero
            await queryRunner.query(`
                ALTER TABLE "cultural_content" 
                ADD COLUMN "category" character varying(50)
            `);

            // Actualizar registros existentes
            await queryRunner.query(`
                UPDATE "cultural_content" 
                SET "category" = 'general' 
                WHERE "category" IS NULL
            `);

            // Hacer la columna NOT NULL
            await queryRunner.query(`
                ALTER TABLE "cultural_content" 
                ALTER COLUMN "category" SET NOT NULL,
                ALTER COLUMN "category" SET DEFAULT 'general'
            `);
        }

        // Verificar si la columna content existe
        const hasContent = await queryRunner.hasColumn("cultural_content", "content");
        if (!hasContent) {
            // Agregar columna content como nullable primero
            await queryRunner.query(`
                ALTER TABLE "cultural_content" 
                ADD COLUMN "content" text
            `);

            // Actualizar registros existentes usando la descripción como contenido inicial
            await queryRunner.query(`
                UPDATE "cultural_content" 
                SET "content" = "description" 
                WHERE "content" IS NULL
            `);

            // Hacer la columna NOT NULL
            await queryRunner.query(`
                ALTER TABLE "cultural_content" 
                ALTER COLUMN "content" SET NOT NULL
            `);
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Verificar y eliminar la columna content
        const hasContent = await queryRunner.hasColumn("cultural_content", "content");
        if (hasContent) {
            await queryRunner.query(`
                ALTER TABLE "cultural_content" DROP COLUMN "content"
            `);
        }

        // Verificar y eliminar la columna category
        const hasCategory = await queryRunner.hasColumn("cultural_content", "category");
        if (hasCategory) {
            await queryRunner.query(`
                ALTER TABLE "cultural_content" DROP COLUMN "category"
            `);
        }
    }
} 