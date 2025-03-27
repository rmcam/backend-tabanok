import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateTables1709853742000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // Crear el enum para ActivityType si no existe
        await queryRunner.query(`
            DO $$ 
            BEGIN
                IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'activity_type_enum') THEN
                    CREATE TYPE activity_type_enum AS ENUM ('quiz', 'memory', 'matching', 'listening', 'speaking');
                END IF;
            END $$;
        `);

        // Crear el enum para DifficultyLevel si no existe
        await queryRunner.query(`
            DO $$ 
            BEGIN
                IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'activity_difficulty_enum') THEN
                    CREATE TYPE activity_difficulty_enum AS ENUM ('beginner', 'intermediate', 'advanced');
                END IF;
            END $$;
        `);

        // Crear la tabla topic si no existe
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "topic" (
                "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
                "name" character varying NOT NULL,
                "description" text,
                "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Crear la tabla activity si no existe
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "activity" (
                "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
                "title" character varying NOT NULL,
                "description" text,
                "type" activity_type_enum NOT NULL,
                "difficulty" activity_difficulty_enum DEFAULT 'beginner',
                "content" jsonb NOT NULL,
                "points" integer DEFAULT 0,
                "timeLimit" integer DEFAULT 300,
                "topicId" uuid,
                "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                "deletedAt" TIMESTAMP,
                CONSTRAINT "FK_activity_topic" FOREIGN KEY ("topicId") REFERENCES "topic"("id")
            )
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE IF EXISTS "activity"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "topic"`);
        await queryRunner.query(`DROP TYPE IF EXISTS activity_type_enum`);
        await queryRunner.query(`DROP TYPE IF EXISTS activity_difficulty_enum`);
    }
} 