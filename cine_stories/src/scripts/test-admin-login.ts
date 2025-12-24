import 'reflect-metadata';
import { AppDataSource } from '../data-source';
import { User } from '../infrastructure/database/entities/user.entity';
import * as argon2 from 'argon2';

async function testAdminLogin() {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🔐 Testing Admin Login...');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  await AppDataSource.initialize();
  
  const email = 'rishabhsingh4554@gmail.com';
  const password = 'Rishabh4554@';
  
  const userRepo = AppDataSource.getRepository(User);
  
  // Step 1: Find user exactly as AuthService does
  console.log('\n1️⃣ Finding user (same query as AuthService)...');
  const user = await userRepo
    .createQueryBuilder('user')
    .where('user.email = :email', { email })
    .andWhere('user.deletedAt IS NULL')
    .select(['user.id', 'user.email', 'user.passwordHash', 'user.roles'])
    .getOne();
  
  if (!user) {
    console.log('❌ User not found!');
    
    // Check if user exists but is soft-deleted
    const deletedUser = await userRepo
      .createQueryBuilder('user')
      .where('user.email = :email', { email })
      .withDeleted()
      .getOne();
    
    if (deletedUser) {
      console.log('⚠️  User exists but is SOFT-DELETED:', {
        id: deletedUser.id,
        deletedAt: deletedUser.deletedAt,
      });
      console.log('   → User needs to be restored or re-seeded');
    } else {
      console.log('⚠️  User does not exist at all!');
      console.log('   → Run: npm run seed:admin');
    }
    
    await AppDataSource.destroy();
    return;
  }
  
  console.log('✅ User found:', {
    id: user.id,
    email: user.email,
    hasPasswordHash: !!user.passwordHash,
    roles: user.roles,
  });
  
  // Step 2: Check password hash
  if (!user.passwordHash) {
    console.log('\n❌ User has NO password hash!');
    console.log('   → Password was not saved during seed');
    console.log('   → Re-seed the admin user');
    await AppDataSource.destroy();
    return;
  }
  
  console.log('\n2️⃣ Verifying password...');
  console.log('   Password to verify:', password);
  console.log('   Hash exists:', !!user.passwordHash);
  console.log('   Hash length:', user.passwordHash.length);
  
  // Step 3: Verify password
  try {
    const isValid = await argon2.verify(user.passwordHash, password);
    
    if (isValid) {
      console.log('✅ Password is VALID!');
      console.log('\n✅ Login should work!');
      console.log('\n🔍 If login still fails, check:');
      console.log('   1. API logs for error messages');
      console.log('   2. JWT_SECRET is set correctly');
      console.log('   3. Frontend is sending correct email/password');
    } else {
      console.log('❌ Password is INVALID!');
      console.log('\n⚠️  Possible issues:');
      console.log('   1. Password hash was corrupted');
      console.log('   2. Wrong password is being used');
      console.log('   3. Password was changed after seeding');
      console.log('\n   → Solution: Re-seed admin user');
      console.log('   → Run: npm run seed:admin');
    }
  } catch (error) {
    console.log('❌ Error verifying password:', error);
    console.log('   → Password hash might be corrupted');
    console.log('   → Re-seed admin user');
  }
  
  // Step 4: Check all admin users
  console.log('\n3️⃣ Checking all admin users in database...');
  const allAdmins = await userRepo
    .createQueryBuilder('user')
    .where("user.roles @> ARRAY['admin']::users_roles_enum[]")
    .withDeleted()
    .getMany();
  
  console.log(`   Found ${allAdmins.length} admin user(s):`);
  allAdmins.forEach((admin, idx) => {
    console.log(`   ${idx + 1}. ${admin.email} (ID: ${admin.id})`);
    console.log(`      Deleted: ${admin.deletedAt ? admin.deletedAt : 'No'}`);
    console.log(`      Has Password: ${!!admin.passwordHash}`);
  });
  
  await AppDataSource.destroy();
  
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
}

testAdminLogin().catch((err) => {
  console.error('❌ Error:', err);
  process.exit(1);
});

