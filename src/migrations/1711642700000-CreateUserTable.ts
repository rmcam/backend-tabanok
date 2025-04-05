import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateUserTable1711642700000 implements MigrationInterface {
    name = 'CreateUserTable1711642700000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Crear el enum para los roles de usuario
        await queryRunner.query(`
            DO $$
            BEGIN
                IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role_enum') THEN
                    CREATE TYPE user_role_enum AS ENUM ('user', 'admin', 'teacher');
                END IF;
            END $$;
        `);

        // Crear la tabla de usuarios
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "user" (
                "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
                "firstName" character varying NOT NULL,
                "lastName" character varying NOT NULL,
                "email" character varying NOT NULL UNIQUE,
                "password" character varying NOT NULL,
                "role" user_role_enum NOT NULL DEFAULT 'user',
                "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
            )
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE IF EXISTS "user" CASCADE`);
        await queryRunner.query(`DROP TYPE IF EXISTS user_role_enum CASCADE`);
    }
} 