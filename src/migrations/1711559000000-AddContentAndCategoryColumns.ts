import { MigrationInterface, QueryRunner } from "typeorm";

export class AddContentAndCategoryColumns1711559000000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // Agregar columna category si no existe
        await queryRunner.query(`
            DO $$ 
            BEGIN
                IF NOT EXISTS (
                    SELECT 1 
                    FROM information_schema.columns 
                    WHERE table_name = 'cultural_content' 
                    AND column_name = 'category'
                ) THEN
                    ALTER TABLE "cultural_content"
                    ADD COLUMN "category" varchar DEFAULT 'general';
                END IF;
            END $$;
        `);

        // Asegurarse de que todos los registros tengan un valor en category
        await queryRunner.query(`
            UPDATE "cultural_content"
            SET "category" = 'general'
            WHERE "category" IS NULL;
        `);

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
        await queryRunner.query(`
            ALTER TABLE "cultural_content"
            DROP COLUMN IF EXISTS "category";
        `);

        // Verificar y eliminar la columna content
        const hasContent = await queryRunner.hasColumn("cultural_content", "content");
        if (hasContent) {
            await queryRunner.query(`
                ALTER TABLE "cultural_content" DROP COLUMN "content"
            `);
        }
    }
} 