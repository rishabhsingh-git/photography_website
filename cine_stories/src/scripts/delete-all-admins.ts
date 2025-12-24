import 'reflect-metadata';
import { AppDataSource } from '../data-source';
import { User } from '../infrastructure/database/entities/user.entity';

async function deleteAllAdmins() {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🗑️  Deleting ALL admin users...');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  await AppDataSource.initialize();
  
  const userRepo = AppDataSource.getRepository(User);
  
  // Get all admin users including soft-deleted
  const allAdmins = await userRepo
    .createQueryBuilder('user')
    .where("user.roles @> ARRAY['admin']::users_roles_enum[]")
    .withDeleted() // Include soft-deleted
    .getMany();
  
  if (allAdmins.length === 0) {
    console.log('\n✅ No admin users found to delete.');
    await AppDataSource.destroy();
    return;
  }
  
  console.log(`\n📊 Found ${allAdmins.length} admin user(s) to delete:\n`);
  allAdmins.forEach((admin, idx) => {
    console.log(`   ${idx + 1}. ${admin.email} (ID: ${admin.id})`);
  });
  
  // Hard delete all admin users
  console.log('\n🗑️  Performing hard delete...');
  await userRepo.remove(allAdmins);
  
  console.log(`\n✅ Successfully deleted ${allAdmins.length} admin user(s)!`);
  
  // Verify deletion
  const remaining = await userRepo
    .createQueryBuilder('user')
    .where("user.roles @> ARRAY['admin']::users_roles_enum[]")
    .withDeleted()
    .getCount();
  
  if (remaining === 0) {
    console.log('✅ Verification: No admin users remaining in database.');
  } else {
    console.log(`⚠️  Warning: ${remaining} admin user(s) still found in database.`);
  }
  
  await AppDataSource.destroy();
  
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
}

deleteAllAdmins().catch((err) => {
  console.error('❌ Error:', err);
  process.exit(1);
});

