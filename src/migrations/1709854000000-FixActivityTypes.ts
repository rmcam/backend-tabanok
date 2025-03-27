import { MigrationInterface, QueryRunner } from "typeorm";

export class FixActivityTypes1709854000000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // Primero, eliminamos cualquier restricción de clave foránea que pueda existir
        await queryRunner.query(`
            ALTER TABLE IF EXISTS activity 
            DROP CONSTRAINT IF EXISTS "FK_activity_topic";
        `);

        // Eliminamos el valor por defecto de la columna type
        await queryRunner.query(`
            ALTER TABLE activity 
            ALTER COLUMN type DROP DEFAULT;
        `);

        // Convertimos la columna a texto
        await queryRunner.query(`
            ALTER TABLE activity 
            ALTER COLUMN type TYPE text;
        `);

        // Actualizamos los valores existentes
        await queryRunner.query(`
            UPDATE activity 
            SET type = CASE type
                WHEN 'quiz' THEN 'vocabulary_quiz'
                WHEN 'memory' THEN 'memory_game'
                WHEN 'matching' THEN 'word_matching'
                WHEN 'listening' THEN 'pronunciation_practice'
                WHEN 'speaking' THEN 'cultural_story'
                ELSE 'vocabulary_quiz'
            END;
        `);

        // Eliminamos el tipo enum existente
        await queryRunner.query(`
            DROP TYPE IF EXISTS activity_type_enum CASCADE;
        `);

        // Creamos el nuevo tipo enum
        await queryRunner.query(`
            CREATE TYPE activity_type_enum AS ENUM (
                'vocabulary_quiz',
                'memory_game',
                'word_matching',
                'pronunciation_practice',
                'cultural_story'
            );
        `);

        // Convertimos la columna al nuevo tipo enum
        await queryRunner.query(`
            ALTER TABLE activity 
            ALTER COLUMN type TYPE activity_type_enum 
            USING type::activity_type_enum;
        `);

        // Establecemos la restricción NOT NULL y el valor por defecto
        await queryRunner.query(`
            ALTER TABLE activity 
            ALTER COLUMN type SET NOT NULL,
            ALTER COLUMN type SET DEFAULT 'vocabulary_quiz'::activity_type_enum;
        `);

        // Restauramos la restricción de clave foránea
        await queryRunner.query(`
            ALTER TABLE activity 
            ADD CONSTRAINT "FK_activity_topic" 
            FOREIGN KEY ("topicId") 
            REFERENCES "topic"("id");
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Eliminamos la restricción de clave foránea
        await queryRunner.query(`
            ALTER TABLE activity 
            DROP CONSTRAINT IF EXISTS "FK_activity_topic";
        `);

        // Eliminamos el valor por defecto
        await queryRunner.query(`
            ALTER TABLE activity 
            ALTER COLUMN type DROP DEFAULT;
        `);

        // Convertimos la columna a texto
        await queryRunner.query(`
            ALTER TABLE activity 
            ALTER COLUMN type TYPE text;
        `);

        // Revertimos los valores
        await queryRunner.query(`
            UPDATE activity 
            SET type = CASE type
                WHEN 'vocabulary_quiz' THEN 'quiz'
                WHEN 'memory_game' THEN 'memory'
                WHEN 'word_matching' THEN 'matching'
                WHEN 'pronunciation_practice' THEN 'listening'
                WHEN 'cultural_story' THEN 'speaking'
                ELSE 'quiz'
            END;
        `);

        // Eliminamos el tipo enum
        await queryRunner.query(`
            DROP TYPE IF EXISTS activity_type_enum CASCADE;
        `);

        // Recreamos el tipo enum original
        await queryRunner.query(`
            CREATE TYPE activity_type_enum AS ENUM (
                'quiz',
                'memory',
                'matching',
                'listening',
                'speaking'
            );
        `);

        // Convertimos la columna de vuelta al tipo enum original
        await queryRunner.query(`
            ALTER TABLE activity 
            ALTER COLUMN type TYPE activity_type_enum 
            USING type::activity_type_enum;
        `);

        // Restauramos la restricción NOT NULL y el valor por defecto
        await queryRunner.query(`
            ALTER TABLE activity 
            ALTER COLUMN type SET NOT NULL,
            ALTER COLUMN type SET DEFAULT 'quiz'::activity_type_enum;
        `);

        // Restauramos la restricción de clave foránea
        await queryRunner.query(`
            ALTER TABLE activity 
            ADD CONSTRAINT "FK_activity_topic" 
            FOREIGN KEY ("topicId") 
            REFERENCES "topic"("id");
        `);
    }
} 