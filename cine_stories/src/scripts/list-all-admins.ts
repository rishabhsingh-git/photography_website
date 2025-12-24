import 'reflect-metadata';
import { AppDataSource } from '../data-source';
import { User } from '../infrastructure/database/entities/user.entity';

async function listAllAdmins() {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('👥 Listing ALL admin users (including deleted)...');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  await AppDataSource.initialize();
  
  const userRepo = AppDataSource.getRepository(User);
  
  // Get all admin users including soft-deleted
  const allAdmins = await userRepo
    .createQueryBuilder('user')
    .where("user.roles @> ARRAY['admin']::users_roles_enum[]")
    .withDeleted() // Include soft-deleted
    .orderBy('user.createdAt', 'DESC')
    .getMany();
  
  console.log(`\n📊 Found ${allAdmins.length} admin user(s):\n`);
  
  if (allAdmins.length === 0) {
    console.log('   ⚠️  No admin users found!');
  } else {
    allAdmins.forEach((admin, idx) => {
      console.log(`   ${idx + 1}. Admin User:`);
      console.log(`      ID: ${admin.id}`);
      console.log(`      Email: ${admin.email}`);
      console.log(`      Name: ${admin.name || 'N/A'}`);
      console.log(`      Created: ${admin.createdAt}`);
      console.log(`      Updated: ${admin.updatedAt}`);
      console.log(`      Deleted: ${admin.deletedAt ? admin.deletedAt : 'No (Active)'}`);
      console.log(`      Has Password: ${!!admin.passwordHash}`);
      console.log('');
    });
    
    // Show SQL commands to delete
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🗑️  SQL Commands to Delete Manually in DBeaver:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    allAdmins.forEach((admin, idx) => {
      console.log(`-- Delete admin #${idx + 1} (${admin.email}):`);
      console.log(`DELETE FROM users WHERE id = '${admin.id}';`);
      console.log('');
    });
    
    // Or delete all at once
    const allIds = allAdmins.map(a => `'${a.id}'`).join(', ');
    console.log('-- Or delete ALL admin users at once:');
    console.log(`DELETE FROM users WHERE id IN (${allIds});`);
    console.log('');
  }
  
  await AppDataSource.destroy();
  
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
}

listAllAdmins().catch((err) => {
  console.error('❌ Error:', err);
  process.exit(1);
});

