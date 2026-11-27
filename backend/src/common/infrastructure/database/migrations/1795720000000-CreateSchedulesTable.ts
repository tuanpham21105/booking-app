import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateSchedulesTable1795720000000 implements MigrationInterface {
  name = 'CreateSchedulesTable1795720000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "schedules" ("id" SERIAL NOT NULL, "service_id" integer NOT NULL, "date" date NOT NULL, "start_time" TIME NOT NULL, "duration" integer NOT NULL, "total_slots" integer NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_schedules_id" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_schedules_service_id" ON "schedules" ("service_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_schedules_date" ON "schedules" ("date")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_schedules_service_id_date" ON "schedules" ("service_id", "date")`,
    );
    await queryRunner.query(
      `ALTER TABLE "schedules" ADD CONSTRAINT "FK_schedules_service_id" FOREIGN KEY ("service_id") REFERENCES "services"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "schedules" DROP CONSTRAINT "FK_schedules_service_id"`,
    );
    await queryRunner.query(`DROP INDEX "public"."IDX_schedules_service_id_date"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_schedules_date"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_schedules_service_id"`);
    await queryRunner.query(`DROP TABLE "schedules"`);
  }
}
