import { MigrationInterface, QueryRunner } from "typeorm";

export class FixUsersRolesNull1766123456789 implements MigrationInterface {
    name = 'FixUsersRolesNull1766123456789'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Check if roles column exists and if enum type exists
        const table = await queryRunner.getTable('users');
        const rolesColumn = table?.findColumnByName('roles');
        
        if (!rolesColumn) {
            console.log('Roles column does not exist, skipping migration');
            return;
        }

        // Check if enum type exists, create if not
        const enumExists = await queryRunner.query(`
            SELECT EXISTS (
                SELECT 1 FROM pg_type WHERE typname = 'users_roles_enum'
            )
        `);

        if (!enumExists[0].exists) {
            await queryRunner.query(`CREATE TYPE "public"."users_roles_enum" AS ENUM('client', 'admin')`);
        }

        // Step 1: Update all NULL roles to have default value ['client']
        await queryRunner.query(`
            UPDATE "users" 
            SET "roles" = ARRAY['client']::users_roles_enum[]
            WHERE "roles" IS NULL
        `);

        // Step 2: If roles column is nullable, make it NOT NULL
        // First check if column is nullable
        const isNullable = await queryRunner.query(`
            SELECT is_nullable 
            FROM information_schema.columns 
            WHERE table_name = 'users' AND column_name = 'roles'
        `);

        if (isNullable[0]?.is_nullable === 'YES') {
            // Set default value first
            await queryRunner.query(`
                ALTER TABLE "users" 
                ALTER COLUMN "roles" SET DEFAULT ARRAY['client']::users_roles_enum[]
            `);

            // Then make it NOT NULL
            await queryRunner.query(`
                ALTER TABLE "users" 
                ALTER COLUMN "roles" SET NOT NULL
            `);
        }

        console.log('✅ Fixed NULL roles values in users table');
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Revert: Make roles nullable again (if needed)
        await queryRunner.query(`
            ALTER TABLE "users" 
            ALTER COLUMN "roles" DROP NOT NULL
        `);
        
        await queryRunner.query(`
            ALTER TABLE "users" 
            ALTER COLUMN "roles" DROP DEFAULT
        `);
    }
}

