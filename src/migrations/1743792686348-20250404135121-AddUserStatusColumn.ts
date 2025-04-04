import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration20250404135121AddUserStatusColumn1743792686348 implements MigrationInterface {
    name = '20250404135121AddUserStatusColumn1743792686348'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."user_achievements_status_enum" AS ENUM('IN_PROGRESS', 'COMPLETED', 'FAILED')`);
        await queryRunner.query(`CREATE TABLE "user_achievements" ("userId" uuid NOT NULL, "achievementId" uuid NOT NULL, "status" "public"."user_achievements_status_enum" NOT NULL DEFAULT 'IN_PROGRESS', "progress" json, "completedAt" TIMESTAMP, "dateAwarded" TIMESTAMP NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_c1acd69cf91b1e353634c152dd7" PRIMARY KEY ("userId", "achievementId"))`);
        await queryRunner.query(`CREATE TYPE "public"."rewards_type_enum" AS ENUM('badge', 'points', 'achievement', 'cultural', 'experience', 'content')`);
        await queryRunner.query(`CREATE TYPE "public"."rewards_trigger_enum" AS ENUM('level_up')`);
        await queryRunner.query(`CREATE TABLE "rewards" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "title" character varying NOT NULL, "description" text NOT NULL, "type" "public"."rewards_type_enum" NOT NULL DEFAULT 'badge', "trigger" "public"."rewards_trigger_enum" NOT NULL DEFAULT 'level_up', "pointsCost" integer NOT NULL DEFAULT '0', "criteria" json, "conditions" json, "rewardValue" json NOT NULL, "isLimited" boolean NOT NULL DEFAULT false, "limitedQuantity" integer, "startDate" TIMESTAMP, "endDate" TIMESTAMP, "timesAwarded" integer NOT NULL DEFAULT '0', "points" integer NOT NULL DEFAULT '0', "isSecret" boolean NOT NULL DEFAULT false, "isActive" boolean NOT NULL DEFAULT true, "expirationDays" integer, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_3d947441a48debeb9b7366f8b8c" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "user_rewards" ("userId" uuid NOT NULL, "rewardId" uuid NOT NULL, "status" character varying NOT NULL DEFAULT 'ACTIVE', "metadata" json, "consumedAt" TIMESTAMP, "expiresAt" TIMESTAMP, "dateAwarded" TIMESTAMP NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_8162d48f7242ea2e1410f5a763d" PRIMARY KEY ("userId", "rewardId"))`);
        await queryRunner.query(`CREATE TABLE "topics" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "title" character varying NOT NULL, "description" character varying, "order" integer NOT NULL DEFAULT '1', "isLocked" boolean NOT NULL DEFAULT false, "requiredPoints" integer NOT NULL DEFAULT '0', "isActive" boolean NOT NULL DEFAULT true, "unityId" uuid NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_e4aa99a3fa60ec3a37d1fc4e853" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "unities" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "title" character varying NOT NULL, "description" character varying, "order" integer NOT NULL DEFAULT '1', "isLocked" boolean NOT NULL DEFAULT false, "requiredPoints" integer NOT NULL DEFAULT '0', "isActive" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_42e005e82cfebf8cedfccd1a8f0" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "lesson" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "title" character varying NOT NULL, "description" character varying, "order" integer NOT NULL DEFAULT '1', "isLocked" boolean NOT NULL DEFAULT false, "isCompleted" boolean NOT NULL DEFAULT false, "requiredPoints" integer NOT NULL DEFAULT '0', "isActive" boolean NOT NULL DEFAULT true, "unityId" uuid NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_0ef25918f0237e68696dee455bd" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "exercises" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "title" character varying NOT NULL, "description" character varying NOT NULL, "type" character varying NOT NULL, "content" json NOT NULL, "difficulty" character varying NOT NULL, "points" integer NOT NULL, "timeLimit" integer NOT NULL DEFAULT '0', "isActive" boolean NOT NULL DEFAULT true, "topicId" uuid NOT NULL, "tags" text, "timesCompleted" integer NOT NULL DEFAULT '0', "averageScore" double precision NOT NULL DEFAULT '0', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "lessonId" uuid, "progressId" uuid, CONSTRAINT "PK_c4c46f5fa89a58ba7c2d894e3c3" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "progress" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "score" integer NOT NULL DEFAULT '0', "isCompleted" boolean NOT NULL DEFAULT false, "answers" json, "isActive" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "userId" uuid, "exerciseId" uuid, CONSTRAINT "PK_79abdfd87a688f9de756a162b6f" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE IF EXISTS "user_achievements"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "rewards"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "user_rewards"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "topics"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "unities"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "lesson"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "exercises"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "progress"`);
    }
}
