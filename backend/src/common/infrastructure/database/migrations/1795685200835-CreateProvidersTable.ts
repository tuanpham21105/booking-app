import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateProvidersTable1795685200835 implements MigrationInterface {
    name = 'CreateProvidersTable1795685200835'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "providers" ("id" SERIAL NOT NULL, "name" character varying(150) NOT NULL, "description" text, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "UQ_714d64ea49206129fa4c7ceee2b" UNIQUE ("name"), CONSTRAINT "PK_af13fc2ebf37a629124a1b0db00" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_714d64ea49206129fa4c7ceee2" ON "providers" ("name")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_714d64ea49206129fa4c7ceee2"`);
        await queryRunner.query(`DROP TABLE "providers"`);
    }
}
