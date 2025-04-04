import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateUserNameFields1711642800000 implements MigrationInterface {
    name = 'UpdateUserNameFields1711642800000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Verificar si la columna name existe
const hasNameColumn = await queryRunner.hasColumn("users", "name");
const hasFirstNameColumn = await queryRunner.hasColumn("users", "firstName");
const hasLastNameColumn = await queryRunner.hasColumn("users", "lastName");

        if (hasNameColumn) {
            // Si la columna name existe, crear las nuevas columnas y migrar los datos
            if (!hasFirstNameColumn) {
                await queryRunner.query(`ALTER TABLE "users" ADD "firstName" character varying`);
            }
            if (!hasLastNameColumn) {
                await queryRunner.query(`ALTER TABLE "users" ADD "lastName" character varying`);
            }

            // Migrar los datos
            await queryRunner.query(`
                UPDATE "users"
                SET "firstName" = SPLIT_PART("name", ' ', 1),
                    "lastName" = SUBSTRING("name" FROM POSITION(' ' IN "name") + 1)
                WHERE "name" IS NOT NULL AND "firstName" IS NULL AND "lastName" IS NULL
            `);

            // Establecer las columnas como NOT NULL
            if (!hasFirstNameColumn) {
                await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "firstName" SET NOT NULL`);
            }
            if (!hasLastNameColumn) {
                await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "lastName" SET NOT NULL`);
            }

            // Eliminar la columna name
            await queryRunner.query(`ALTER TABLE "users" DROP COLUMN IF EXISTS "name"`);
        } else {
            // Si la columna name no existe, verificar y crear las nuevas columnas si es necesario
            if (!hasFirstNameColumn) {
                await queryRunner.query(`ALTER TABLE "users" ADD "firstName" character varying NOT NULL`);
            }
            if (!hasLastNameColumn) {
                await queryRunner.query(`ALTER TABLE "users" ADD "lastName" character varying NOT NULL`);
            }
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Verificar si las columnas firstName y lastName existen
const hasFirstNameColumn = await queryRunner.hasColumn("users", "firstName");
const hasLastNameColumn = await queryRunner.hasColumn("users", "lastName");

        if (hasFirstNameColumn && hasLastNameColumn) {
            // Agregar la columna name
            await queryRunner.query(`ALTER TABLE "users" ADD "name" character varying`);

            // Combinar firstName y lastName en name
            await queryRunner.query(`
                UPDATE "users"
                SET "name" = "firstName" || ' ' || "lastName"
                WHERE "firstName" IS NOT NULL AND "lastName" IS NOT NULL
            `);

            // Establecer name como NOT NULL
            await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "name" SET NOT NULL`);

            // Eliminar las columnas firstName y lastName
            await queryRunner.query(`
                ALTER TABLE "users"
                DROP COLUMN "firstName",
                DROP COLUMN "lastName"
            `);
        }
    }
}
