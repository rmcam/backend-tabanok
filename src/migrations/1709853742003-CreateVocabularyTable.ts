import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateVocabularyTable1709853742003 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "vocabulary" (
                "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
                "wordKamentsa" character varying NOT NULL,
                "wordSpanish" character varying NOT NULL,
                "pronunciation" character varying,
                "culturalContext" text,
                "audioUrl" character varying,
                "imageUrl" character varying,
                "examples" text[],
                "category" text,
                "difficultyLevel" integer DEFAULT 1,
                "topicId" uuid,
                "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                CONSTRAINT "FK_vocabulary_topic" FOREIGN KEY ("topicId") REFERENCES "topic"("id")
            )
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE IF EXISTS "vocabulary"`);
    }
} 