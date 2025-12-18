import { MigrationInterface, QueryRunner } from "typeorm";

export class EnsureUsersColumns1766124000000 implements MigrationInterface {
    name = 'EnsureUsersColumns1766124000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        const table = await queryRunner.getTable('users');
        if (!table) {
            console.log('Users table does not exist, skipping');
            return;
        }

        // Check and add name column if missing
        const nameColumn = table.findColumnByName('name');
        if (!nameColumn) {
            await queryRunner.query(`ALTER TABLE "users" ADD COLUMN "name" text`);
            console.log('✅ Added name column');
        }

        // Check and add phone column if missing
        const phoneColumn = table.findColumnByName('phone');
        if (!phoneColumn) {
            await queryRunner.query(`ALTER TABLE "users" ADD COLUMN "phone" text`);
            console.log('✅ Added phone column');
        }

        // Check and add address column if missing
        const addressColumn = table.findColumnByName('address');
        if (!addressColumn) {
            await queryRunner.query(`ALTER TABLE "users" ADD COLUMN "address" text`);
            console.log('✅ Added address column');
        }

        // Check and add oauthId column if missing
        const oauthIdColumn = table.findColumnByName('oauthId');
        if (!oauthIdColumn) {
            await queryRunner.query(`ALTER TABLE "users" ADD COLUMN "oauthId" text`);
            console.log('✅ Added oauthId column');
        }

        // Ensure passwordHash column exists
        const passwordHashColumn = table.findColumnByName('passwordHash');
        if (!passwordHashColumn) {
            await queryRunner.query(`ALTER TABLE "users" ADD COLUMN "passwordHash" text`);
            console.log('✅ Added passwordHash column');
        }

        console.log('✅ All user columns verified');
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Optional: Remove columns if needed (not recommended)
        // await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "name"`);
        // await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "phone"`);
        // await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "address"`);
        // await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "oauthId"`);
    }
}

