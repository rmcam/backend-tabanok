import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateCulturalContent1711558800000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "cultural_content" (
                "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
                "title" varchar NOT NULL,
                "description" text NOT NULL,
                "cultural_context" varchar NOT NULL,
                "media_url" varchar,
                "type" varchar NOT NULL,
                "tags" text[],
                "is_active" boolean NOT NULL DEFAULT true,
                "created_at" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
                "updated_at" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
            )
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE IF EXISTS "cultural_content"`);
    }
} 