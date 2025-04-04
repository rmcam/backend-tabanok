import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateAccountTable1709853742001 implements MigrationInterface {
    name = 'CreateAccountTable1709853742001'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE "account" (
                "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
                "streak" integer NOT NULL DEFAULT 0,
                "lastActivity" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                "settings" jsonb DEFAULT '{}',
                "preferences" jsonb DEFAULT '{}',
                "isActive" boolean NOT NULL DEFAULT true,
                "points" integer NOT NULL DEFAULT 0,
                "level" integer NOT NULL DEFAULT 1,
                "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                "userId" uuid NOT NULL UNIQUE,
                CONSTRAINT "FK_account_user" FOREIGN KEY ("userId") 
REFERENCES "users"("id") ON DELETE CASCADE
            )
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE IF EXISTS "account" CASCADE`);
    }
}
