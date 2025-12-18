import { MigrationInterface, QueryRunner } from "typeorm";

export class AddServicesTable1765889230859 implements MigrationInterface {
    name = 'AddServicesTable1765889230859'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "services" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "title" character varying NOT NULL, "slogan" text, "description" text, "highlights" text array NOT NULL DEFAULT ARRAY[]::text[], "price" numeric(10,2) NOT NULL, "discountedPrice" numeric(10,2), "isActive" boolean NOT NULL DEFAULT true, "metadata" jsonb NOT NULL DEFAULT '{}', "imageUrl" text, "icon" text, CONSTRAINT "PK_ba8571f8c5b4e5e5e5e5e5e5e5e5e5e" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "idx_service_title" ON "services" ("title") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."idx_service_title"`);
        await queryRunner.query(`DROP TABLE "services"`);
    }
}

