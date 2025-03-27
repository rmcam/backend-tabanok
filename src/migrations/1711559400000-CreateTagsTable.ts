import { MigrationInterface, QueryRunner } from "typeorm";
import { TagColor, TagType } from "../features/statistics/interfaces/tag.interface";

export class CreateTagsTable1711559400000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // Crear tipos enum
        await queryRunner.query(`
            CREATE TYPE "tag_type_enum" AS ENUM (
                '${TagType.DIFFICULTY}',
                '${TagType.TOPIC}',
                '${TagType.SKILL}',
                '${TagType.CULTURAL}',
                '${TagType.CUSTOM}'
            )
        `);

        await queryRunner.query(`
            CREATE TYPE "tag_color_enum" AS ENUM (
                '${TagColor.RED}',
                '${TagColor.BLUE}',
                '${TagColor.GREEN}',
                '${TagColor.YELLOW}',
                '${TagColor.PURPLE}',
                '${TagColor.ORANGE}',
                '${TagColor.PINK}',
                '${TagColor.GRAY}'
            )
        `);

        // Crear tabla de etiquetas
        await queryRunner.query(`
            CREATE TABLE "tags" (
                "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
                "name" varchar(50) NOT NULL,
                "type" tag_type_enum NOT NULL DEFAULT '${TagType.CUSTOM}',
                "color" tag_color_enum NOT NULL DEFAULT '${TagColor.GRAY}',
                "description" text,
                "parentId" uuid REFERENCES "tags" ("id") ON DELETE SET NULL,
                "metadata" jsonb,
                "usageCount" integer NOT NULL DEFAULT 0,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now()
            )
        `);

        // Crear índices
        await queryRunner.query(`
            CREATE INDEX "idx_tags_name" ON "tags" ("name");
            CREATE INDEX "idx_tags_type" ON "tags" ("type");
            CREATE INDEX "idx_tags_usage_count" ON "tags" ("usageCount" DESC);
        `);

        // Insertar etiquetas predefinidas
        await queryRunner.query(`
            INSERT INTO "tags" (name, type, color, description) VALUES
            ('Principiante', '${TagType.DIFFICULTY}', '${TagColor.GREEN}', 'Contenido para nivel principiante'),
            ('Intermedio', '${TagType.DIFFICULTY}', '${TagColor.YELLOW}', 'Contenido para nivel intermedio'),
            ('Avanzado', '${TagType.DIFFICULTY}', '${TagColor.RED}', 'Contenido para nivel avanzado'),
            
            ('Vocabulario', '${TagType.TOPIC}', '${TagColor.BLUE}', 'Palabras y frases en Kamëntsá'),
            ('Gramática', '${TagType.TOPIC}', '${TagColor.PURPLE}', 'Reglas gramaticales del Kamëntsá'),
            ('Pronunciación', '${TagType.TOPIC}', '${TagColor.PINK}', 'Guías de pronunciación'),
            
            ('Lectura', '${TagType.SKILL}', '${TagColor.ORANGE}', 'Ejercicios de comprensión lectora'),
            ('Escritura', '${TagType.SKILL}', '${TagColor.GREEN}', 'Práctica de escritura'),
            ('Conversación', '${TagType.SKILL}', '${TagColor.BLUE}', 'Práctica de diálogo'),
            
            ('Festividades', '${TagType.CULTURAL}', '${TagColor.YELLOW}', 'Celebraciones tradicionales'),
            ('Costumbres', '${TagType.CULTURAL}', '${TagColor.PURPLE}', 'Tradiciones y costumbres'),
            ('Historia', '${TagType.CULTURAL}', '${TagColor.RED}', 'Historia del pueblo Kamëntsá')
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Eliminar índices
        await queryRunner.query(`
            DROP INDEX IF EXISTS "idx_tags_name";
            DROP INDEX IF EXISTS "idx_tags_type";
            DROP INDEX IF EXISTS "idx_tags_usage_count";
        `);

        // Eliminar tabla
        await queryRunner.query(`DROP TABLE IF EXISTS "tags"`);

        // Eliminar tipos enum
        await queryRunner.query(`DROP TYPE IF EXISTS "tag_type_enum"`);
        await queryRunner.query(`DROP TYPE IF EXISTS "tag_color_enum"`);
    }
} 