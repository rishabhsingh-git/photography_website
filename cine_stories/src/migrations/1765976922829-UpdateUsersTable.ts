import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateUsersTable1765976922829 implements MigrationInterface {
    name = 'UpdateUsersTable1765976922829'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "services" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "title" character varying NOT NULL, "slogan" text, "description" text, "highlights" text array NOT NULL DEFAULT ARRAY[]::text[], "price" numeric(10,2) NOT NULL, "discountedPrice" numeric(10,2), "isActive" boolean NOT NULL DEFAULT true, "metadata" jsonb NOT NULL DEFAULT '{}', "imageUrl" text, "icon" text, CONSTRAINT "PK_ba2d347a3168a296416c6c5ccb2" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "idx_service_title" ON "services" ("title") `);
        await queryRunner.query(`CREATE TYPE "public"."notifications_channel_enum" AS ENUM('email', 'sms', 'whatsapp', 'push')`);
        await queryRunner.query(`CREATE TABLE "notifications" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "title" character varying NOT NULL, "body" text NOT NULL, "channel" "public"."notifications_channel_enum" NOT NULL, "delivered" boolean NOT NULL DEFAULT false, "userId" uuid, CONSTRAINT "PK_6a72c3c0f683f6462415e653c3a" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."payments_provider_enum" AS ENUM('razorpay')`);
        await queryRunner.query(`CREATE TABLE "payments" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "provider" "public"."payments_provider_enum" NOT NULL, "referenceId" character varying NOT NULL, "payload" jsonb NOT NULL DEFAULT '{}', "status" character varying NOT NULL DEFAULT 'pending', "userId" uuid, CONSTRAINT "PK_197ab7af18c93fbb0c9b28b4a59" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."users_provider_enum" AS ENUM('local', 'google', 'facebook')`);
        await queryRunner.query(`CREATE TYPE "public"."users_roles_enum" AS ENUM('client', 'admin')`);
        await queryRunner.query(`CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "email" character varying NOT NULL, "passwordHash" text, "provider" "public"."users_provider_enum" NOT NULL DEFAULT 'local', "roles" "public"."users_roles_enum" array NOT NULL, "name" text, "phone" text, "address" text, "oauthId" text, CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_97672ac88f789774dd47f7c8be" ON "users" ("email") `);
        await queryRunner.query(`CREATE TABLE "categories" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "name" character varying NOT NULL, CONSTRAINT "UQ_8b0be371d28245da6e4f4b61878" UNIQUE ("name"), CONSTRAINT "PK_24dbc6126a28ff948da33e97d3b" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "tags" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "name" character varying NOT NULL, CONSTRAINT "PK_e7dc17249a1148a1970748eda99" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_d90243459a697eadb8ad56e909" ON "tags" ("name") `);
        await queryRunner.query(`CREATE TABLE "photos" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "title" character varying NOT NULL, "description" text, "objectKey" character varying NOT NULL, "url" character varying NOT NULL, "metadata" jsonb NOT NULL DEFAULT '{}', "colors" jsonb NOT NULL DEFAULT '[]', "ownerId" uuid, "categoryId" uuid, CONSTRAINT "PK_5220c45b8e32d49d767b9b3d725" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "idx_photo_title" ON "photos" ("title") `);
        await queryRunner.query(`CREATE TABLE "cart_items" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "quantity" integer NOT NULL DEFAULT '1', "userId" uuid, "serviceId" uuid, CONSTRAINT "PK_6fccf5ec03c172d27a28a82928b" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "photos_tags_tags" ("photosId" uuid NOT NULL, "tagsId" uuid NOT NULL, CONSTRAINT "PK_3764f5dc63602352254ffa7e179" PRIMARY KEY ("photosId", "tagsId"))`);
        await queryRunner.query(`CREATE INDEX "IDX_04f0d2b3b481c0bb1e77388cd9" ON "photos_tags_tags" ("photosId") `);
        await queryRunner.query(`CREATE INDEX "IDX_82bbcd6211e71e873b5710f0e0" ON "photos_tags_tags" ("tagsId") `);
        await queryRunner.query(`ALTER TABLE "notifications" ADD CONSTRAINT "FK_692a909ee0fa9383e7859f9b406" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "payments" ADD CONSTRAINT "FK_d35cb3c13a18e1ea1705b2817b1" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "photos" ADD CONSTRAINT "FK_556eedea27ffaf50a4ee0c0a058" FOREIGN KEY ("ownerId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "photos" ADD CONSTRAINT "FK_e9e5dc71992adc0e149fe895e06" FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "cart_items" ADD CONSTRAINT "FK_84e765378a5f03ad9900df3a9ba" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "cart_items" ADD CONSTRAINT "FK_eab32bc09f2731f84d2e9a5dacc" FOREIGN KEY ("serviceId") REFERENCES "services"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "photos_tags_tags" ADD CONSTRAINT "FK_04f0d2b3b481c0bb1e77388cd98" FOREIGN KEY ("photosId") REFERENCES "photos"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "photos_tags_tags" ADD CONSTRAINT "FK_82bbcd6211e71e873b5710f0e0e" FOREIGN KEY ("tagsId") REFERENCES "tags"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "photos_tags_tags" DROP CONSTRAINT "FK_82bbcd6211e71e873b5710f0e0e"`);
        await queryRunner.query(`ALTER TABLE "photos_tags_tags" DROP CONSTRAINT "FK_04f0d2b3b481c0bb1e77388cd98"`);
        await queryRunner.query(`ALTER TABLE "cart_items" DROP CONSTRAINT "FK_eab32bc09f2731f84d2e9a5dacc"`);
        await queryRunner.query(`ALTER TABLE "cart_items" DROP CONSTRAINT "FK_84e765378a5f03ad9900df3a9ba"`);
        await queryRunner.query(`ALTER TABLE "photos" DROP CONSTRAINT "FK_e9e5dc71992adc0e149fe895e06"`);
        await queryRunner.query(`ALTER TABLE "photos" DROP CONSTRAINT "FK_556eedea27ffaf50a4ee0c0a058"`);
        await queryRunner.query(`ALTER TABLE "payments" DROP CONSTRAINT "FK_d35cb3c13a18e1ea1705b2817b1"`);
        await queryRunner.query(`ALTER TABLE "notifications" DROP CONSTRAINT "FK_692a909ee0fa9383e7859f9b406"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_82bbcd6211e71e873b5710f0e0"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_04f0d2b3b481c0bb1e77388cd9"`);
        await queryRunner.query(`DROP TABLE "photos_tags_tags"`);
        await queryRunner.query(`DROP TABLE "cart_items"`);
        await queryRunner.query(`DROP INDEX "public"."idx_photo_title"`);
        await queryRunner.query(`DROP TABLE "photos"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_d90243459a697eadb8ad56e909"`);
        await queryRunner.query(`DROP TABLE "tags"`);
        await queryRunner.query(`DROP TABLE "categories"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_97672ac88f789774dd47f7c8be"`);
        await queryRunner.query(`DROP TABLE "users"`);
        await queryRunner.query(`DROP TYPE "public"."users_roles_enum"`);
        await queryRunner.query(`DROP TYPE "public"."users_provider_enum"`);
        await queryRunner.query(`DROP TABLE "payments"`);
        await queryRunner.query(`DROP TYPE "public"."payments_provider_enum"`);
        await queryRunner.query(`DROP TABLE "notifications"`);
        await queryRunner.query(`DROP TYPE "public"."notifications_channel_enum"`);
        await queryRunner.query(`DROP INDEX "public"."idx_service_title"`);
        await queryRunner.query(`DROP TABLE "services"`);
    }

}
