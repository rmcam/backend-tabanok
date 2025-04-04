import { MigrationInterface, QueryRunner, Table, TableForeignKey } from "typeorm";

export class CreateEvaluationTable1711558800000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // Primero creamos la tabla cultural_content si no existe
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "cultural_content" (
                "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
                "title" character varying NOT NULL,
                "description" text,
                "content" text NOT NULL,
                "category" character varying DEFAULT 'general',
                "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Actualizamos los registros existentes
        await queryRunner.query(`
            UPDATE cultural_content 
            SET category = 'general' 
            WHERE category IS NULL
        `);

        // Luego creamos la tabla evaluation
        await queryRunner.createTable(
            new Table({
                name: "evaluation",
                columns: [
                    {
                        name: "id",
                        type: "uuid",
                        isPrimary: true,
                        generationStrategy: "uuid",
                        default: "uuid_generate_v4()",
                    },
                    {
                        name: "userId",
                        type: "uuid",
                    },
                    {
                        name: "culturalContentId",
                        type: "uuid",
                    },
                    {
                        name: "score",
                        type: "int",
                    },
                    {
                        name: "answers",
                        type: "jsonb",
                        isNullable: true,
                    },
                    {
                        name: "attemptsCount",
                        type: "int",
                        default: 0,
                    },
                    {
                        name: "averageScore",
                        type: "float",
                        default: 0,
                    },
                    {
                        name: "timeSpentSeconds",
                        type: "int",
                        default: 0,
                    },
                    {
                        name: "progressMetrics",
                        type: "jsonb",
                        isNullable: true,
                    },
                    {
                        name: "feedback",
                        type: "text",
                        isNullable: true,
                    },
                    {
                        name: "createdAt",
                        type: "timestamp",
                        default: "now()",
                    },
                    {
                        name: "updatedAt",
                        type: "timestamp",
                        default: "now()",
                    },
                ],
            }),
            true
        );

        await queryRunner.createForeignKey(
            "evaluation",
            new TableForeignKey({
                columnNames: ["culturalContentId"],
                referencedColumnNames: ["id"],
                referencedTableName: "cultural_content",
                onDelete: "CASCADE",
            })
        );

        await queryRunner.createForeignKey(
            "evaluation",
            new TableForeignKey({
                columnNames: ["userId"],
                referencedColumnNames: ["id"],
                referencedTableName: "users",
                onDelete: "CASCADE",
            })
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const table = await queryRunner.getTable("evaluation");
        if (table) {
            const foreignKeys = table.foreignKeys;
            for (const foreignKey of foreignKeys) {
                await queryRunner.dropForeignKey("evaluation", foreignKey);
            }
        }
        await queryRunner.dropTable("evaluation");
        await queryRunner.query(`DROP TABLE IF EXISTS "cultural_content" CASCADE`);
    }
}
