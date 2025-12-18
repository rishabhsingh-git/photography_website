import 'reflect-metadata';
import { AppDataSource } from '../data-source';

async function fixRolesNull() {
  try {
    await AppDataSource.initialize();
    console.log('✅ Database connected');

    const queryRunner = AppDataSource.createQueryRunner();
    
    // Check if enum type exists
    const enumExists = await queryRunner.query(`
      SELECT EXISTS (
        SELECT 1 FROM pg_type WHERE typname = 'users_roles_enum'
      )
    `);

    if (!enumExists[0].exists) {
      console.log('Creating users_roles_enum type...');
      await queryRunner.query(`CREATE TYPE "public"."users_roles_enum" AS ENUM('client', 'admin')`);
    }

    // Fix NULL roles - set to default ['client']
    console.log('Fixing NULL roles values...');
    const result = await queryRunner.query(`
      UPDATE "users" 
      SET "roles" = ARRAY['client']::users_roles_enum[]
      WHERE "roles" IS NULL
    `);
    console.log(`✅ Updated ${result[1] || 0} rows with NULL roles`);

    // Check if column is nullable
    const columnInfo = await queryRunner.query(`
      SELECT is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'users' AND column_name = 'roles'
    `);

    if (columnInfo[0]?.is_nullable === 'YES') {
      console.log('Making roles column NOT NULL...');
      
      // Set default first
      await queryRunner.query(`
        ALTER TABLE "users" 
        ALTER COLUMN "roles" SET DEFAULT ARRAY['client']::users_roles_enum[]
      `);

      // Then make it NOT NULL
      await queryRunner.query(`
        ALTER TABLE "users" 
        ALTER COLUMN "roles" SET NOT NULL
      `);
      
      console.log('✅ Roles column is now NOT NULL with default value');
    } else {
      console.log('✅ Roles column is already NOT NULL');
    }

    await queryRunner.release();
    await AppDataSource.destroy();
    console.log('✅ Done!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error fixing roles:', error);
    process.exit(1);
  }
}

fixRolesNull();

