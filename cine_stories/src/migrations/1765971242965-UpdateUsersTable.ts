import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateUsersTable1765971242965 implements MigrationInterface {
    name = 'UpdateUsersTable1765971242965'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Create the user_role enum type
        await queryRunner.query(`CREATE TYPE "public"."users_roles_enum" AS ENUM('client', 'admin')`);
        
        // Add new columns to users table
        await queryRunner.query(`ALTER TABLE "users" ADD COLUMN "name" text`);
        await queryRunner.query(`ALTER TABLE "users" ADD COLUMN "phone" text`);
        await queryRunner.query(`ALTER TABLE "users" ADD COLUMN "address" text`);
        
        // Convert roles from text array to enum array
        // Create a temporary column with the new enum type
        await queryRunner.query(`ALTER TABLE "users" ADD COLUMN "roles_new" "public"."users_roles_enum" array`);
        
        // Migrate existing data: convert text array values to enum array
        // Map 'admin' -> 'admin' enum, 'client' -> 'client' enum, default to 'client'
        await queryRunner.query(`
            UPDATE "users" 
            SET "roles_new" = COALESCE(
                ARRAY(
                    SELECT CASE 
                        WHEN role = 'admin' THEN 'admin'::users_roles_enum
                        WHEN role = 'client' THEN 'client'::users_roles_enum
                        ELSE 'client'::users_roles_enum
                    END
                    FROM unnest(COALESCE("roles", ARRAY[]::text[])) AS role
                ),
                ARRAY['client']::users_roles_enum[]
            )
        `);
        
        // Drop old column and rename new one
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "roles"`);
        await queryRunner.query(`ALTER TABLE "users" RENAME COLUMN "roles_new" TO "roles"`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "roles" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "roles" SET DEFAULT ARRAY['client']::users_roles_enum[]`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Revert roles back to text array
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "roles"`);
        await queryRunner.query(`ALTER TABLE "users" ADD COLUMN "roles" text array NOT NULL DEFAULT '{}'`);
        
        // Remove the new columns
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "address"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "phone"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "name"`);
        
        // Drop the enum type
        await queryRunner.query(`DROP TYPE "public"."users_roles_enum"`);
    }
}
