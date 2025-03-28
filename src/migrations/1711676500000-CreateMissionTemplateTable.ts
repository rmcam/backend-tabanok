import { MigrationInterface, QueryRunner, Table } from "typeorm";
import { MissionFrequency, MissionType } from "../features/gamification/entities/mission.entity";

export class CreateMissionTemplateTable1711676500000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // Crear enums si no existen
        await queryRunner.query(`
            DO $$ BEGIN
                CREATE TYPE mission_type AS ENUM (${Object.values(MissionType).map(type => `'${type}'`).join(', ')});
                CREATE TYPE mission_frequency AS ENUM (${Object.values(MissionFrequency).map(freq => `'${freq}'`).join(', ')});
            EXCEPTION
                WHEN duplicate_object THEN null;
            END $$;
        `);

        await queryRunner.createTable(
            new Table({
                name: "mission_templates",
                columns: [
                    {
                        name: "id",
                        type: "uuid",
                        isPrimary: true,
                        generationStrategy: "uuid",
                        default: "uuid_generate_v4()"
                    },
                    {
                        name: "title",
                        type: "varchar"
                    },
                    {
                        name: "description",
                        type: "varchar"
                    },
                    {
                        name: "type",
                        type: "mission_type"
                    },
                    {
                        name: "frequency",
                        type: "mission_frequency"
                    },
                    {
                        name: "baseTargetValue",
                        type: "int"
                    },
                    {
                        name: "baseRewardPoints",
                        type: "int"
                    },
                    {
                        name: "rewardBadge",
                        type: "jsonb",
                        isNullable: true
                    },
                    {
                        name: "minLevel",
                        type: "int"
                    },
                    {
                        name: "maxLevel",
                        type: "int"
                    },
                    {
                        name: "difficultyScaling",
                        type: "jsonb"
                    },
                    {
                        name: "requirements",
                        type: "jsonb",
                        isNullable: true
                    },
                    {
                        name: "bonusConditions",
                        type: "jsonb",
                        isNullable: true
                    }
                ]
            }),
            true
        );

        // Insertar algunas plantillas de misión por defecto
        await queryRunner.query(`
            INSERT INTO mission_templates (
                title, description, type, frequency, 
                "baseTargetValue", "baseRewardPoints", "minLevel", "maxLevel",
                "difficultyScaling", requirements, "bonusConditions"
            ) VALUES
            (
                'Maestro de Lecciones',
                'Completa un número de lecciones basado en tu nivel',
                'COMPLETE_LESSONS',
                'DAILY',
                3,
                50,
                1,
                0,
                '[
                    {"targetMultiplier": 1, "rewardMultiplier": 1},
                    {"targetMultiplier": 1.5, "rewardMultiplier": 1.3},
                    {"targetMultiplier": 2, "rewardMultiplier": 1.6}
                ]'::jsonb,
                '{"minimumStreak": 0}'::jsonb,
                '[
                    {"condition": "perfect_score", "multiplier": 1.2, "description": "Bonus por puntuación perfecta"},
                    {"condition": "streak_active", "multiplier": 1.1, "description": "Bonus por racha activa"}
                ]'::jsonb
            ),
            (
                'Desafío Cultural',
                'Explora contenido cultural y gana puntos extra',
                'CULTURAL_CONTENT',
                'WEEKLY',
                5,
                100,
                5,
                0,
                '[
                    {"targetMultiplier": 1, "rewardMultiplier": 1},
                    {"targetMultiplier": 1.3, "rewardMultiplier": 1.4},
                    {"targetMultiplier": 1.6, "rewardMultiplier": 1.8}
                ]'::jsonb,
                '{"minimumStreak": 3}'::jsonb,
                '[
                    {"condition": "streak_active", "multiplier": 1.3, "description": "Bonus por racha activa"}
                ]'::jsonb
            );
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable("mission_templates");
        await queryRunner.query(`
            DROP TYPE IF EXISTS mission_type;
            DROP TYPE IF EXISTS mission_frequency;
        `);
    }
} 