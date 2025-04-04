import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class CreateStreakTable1711676400000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: "streaks",
                columns: [
                    {
                        name: "id",
                        type: "uuid",
                        isPrimary: true,
                        generationStrategy: "uuid",
                        default: "uuid_generate_v4()"
                    },
                    {
                        name: "userId",
                        type: "uuid"
                    },
                    {
                        name: "currentStreak",
                        type: "int",
                        default: 0
                    },
                    {
                        name: "longestStreak",
                        type: "int",
                        default: 0
                    },
                    {
                        name: "lastActivityDate",
                        type: "timestamp",
                        isNullable: true
                    },
                    {
                        name: "graceDate",
                        type: "timestamp",
                        isNullable: true
                    },
                    {
                        name: "usedGracePeriod",
                        type: "boolean",
                        default: false
                    },
                    {
                        name: "streakHistory",
                        type: "jsonb",
                        default: "'[]'"
                    },
                    {
                        name: "currentMultiplier",
                        type: "decimal",
                        precision: 3,
                        scale: 1,
                        default: 1
                    }
                ],
                indices: [
                    {
                        name: "IDX_STREAK_USER",
                        columnNames: ["userId"]
                    }
                ],
                foreignKeys: [
                    {
                        columnNames: ["userId"],
                        referencedTableName: "users",
                        referencedColumnNames: ["id"],
                        onDelete: "CASCADE"
                    }
                ]
            }),
            true
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable("streaks");
    }
}
