import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateUserTable1709853742000 implements MigrationInterface {
    name = 'CreateUserTable1709853742000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Verificar si el tipo enum ya existe
        const enumExists = await queryRunner.query(`
            SELECT typname FROM pg_type 
            WHERE typname = 'user_role_enum'
        `);

        if (enumExists.length === 0) {
            // Crear el enum para roles de usuario solo si no existe
            await queryRunner.query(`CREATE TYPE user_role_enum AS ENUM ('user', 'admin', 'teacher')`);
        }

        // Crear la tabla de usuarios
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "users" (
                "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
                "username" character varying NOT NULL,
                "email" character varying NOT NULL UNIQUE,
                "password" character varying NOT NULL,
                "avatar" character varying,
                "profile" jsonb DEFAULT '{}',
                "roles" text[] DEFAULT '{}',
                "role" user_role_enum NOT NULL DEFAULT 'user',
                "isActive" boolean NOT NULL DEFAULT true,
                "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
            )
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE IF EXISTS "users" CASCADE`);
        await queryRunner.query(`DROP TYPE IF EXISTS user_role_enum CASCADE`);
    }
} 