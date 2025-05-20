import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateUserRewardsTable1747053956602 implements MigrationInterface {
    name = 'CreateUserRewardsTable1747053956602'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "user_rewards" ("userId" uuid NOT NULL, "rewardId" uuid NOT NULL, "status" character varying NOT NULL DEFAULT 'ACTIVE', "metadata" json, "consumedAt" TIMESTAMP, "expiresAt" TIMESTAMP, "dateAwarded" TIMESTAMP NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_8162d48f7242ea2e1410f5a763d" PRIMARY KEY ("userId", "rewardId"))`);
        await queryRunner.query(`ALTER TABLE "user_rewards" ADD CONSTRAINT "FK_d538de4678c82491e5a8a8a5834" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user_rewards" ADD CONSTRAINT "FK_d2904b4fa623c996161687e47d1" FOREIGN KEY ("rewardId") REFERENCES "reward"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user_rewards" DROP CONSTRAINT "FK_d2904b4fa623c996161687e47d1"`);
        await queryRunner.query(`ALTER TABLE "user_rewards" DROP CONSTRAINT "FK_d538de4678c82491e5a8a8a5834"`);
        await queryRunner.query(`DROP TABLE "user_rewards"`);
    }

}
