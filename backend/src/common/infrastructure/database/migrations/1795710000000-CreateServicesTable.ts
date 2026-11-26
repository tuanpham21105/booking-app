import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateServicesTable1795710000000 implements MigrationInterface {
  name = 'CreateServicesTable1795710000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "services" ("id" SERIAL NOT NULL, "provider_id" integer NOT NULL, "name" character varying(150) NOT NULL, "description" text, "price" numeric(12,2) NOT NULL DEFAULT '0', "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_services_id" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_services_provider_id" ON "services" ("provider_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_services_name" ON "services" ("name")`,
    );
    await queryRunner.query(
      `ALTER TABLE "services" ADD CONSTRAINT "FK_services_provider_id" FOREIGN KEY ("provider_id") REFERENCES "providers"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "services" DROP CONSTRAINT "FK_services_provider_id"`,
    );
    await queryRunner.query(`DROP INDEX "public"."IDX_services_name"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_services_provider_id"`);
    await queryRunner.query(`DROP TABLE "services"`);
  }
}
