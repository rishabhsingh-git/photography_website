import 'reflect-metadata';
import { AppDataSource } from '../data-source';
import { User, AuthProvider, UserRole } from '../infrastructure/database/entities/user.entity';
import * as argon2 from 'argon2';

async function seedAdmin() {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🌱 [Seed] Starting admin user seed...');
  console.log('🌱 [Seed] Database connection:', {
    host: process.env.DB_HOST || 'from DATABASE_URL',
    database: process.env.DB_NAME || 'from DATABASE_URL',
    url: process.env.DATABASE_URL ? 'Using DATABASE_URL' : 'Using individual config',
  });
  
  await AppDataSource.initialize();
  console.log('✅ [Seed] Database connection initialized');

  const userRepo = AppDataSource.getRepository(User);

  const email = 'rishabhsingh4554@gmail.com';
  const plainPassword = 'Rishabh4554@';

  // Delete existing admin user if it exists (including soft-deleted)
  const existingAdmin = await userRepo
    .createQueryBuilder('user')
    .where('user.email = :email', { email })
    .withDeleted() // Include soft-deleted
    .getOne();
    
  console.log('🔍 [Seed] Existing admin check:', existingAdmin ? {
    id: existingAdmin.id,
    email: existingAdmin.email,
    deletedAt: existingAdmin.deletedAt,
  } : 'Not found');
  
  if (existingAdmin) {
    console.log('🗑️  [Seed] Deleting existing admin user...');
    // Hard delete to ensure clean slate
    await userRepo.remove(existingAdmin);
    console.log('✅ [Seed] Existing admin user deleted');
  }

  // Create new admin user
  console.log('🔨 [Seed] Creating new admin user...');
  const passwordHash = await argon2.hash(plainPassword);
  const admin = userRepo.create({
    email,
    passwordHash,
    provider: AuthProvider.LOCAL,
    roles: [UserRole.ADMIN],
    phone: '7020402206',
    address: '123, Main St, Anytown, USA',
    name: 'Rishabh Singh',
    oauthId: '7020402206',
    deletedAt: null, // Explicitly set to null
  });

  // Use transaction with READ COMMITTED isolation to ensure immediate visibility
  const savedAdmin = await userRepo.manager.transaction(
    'READ COMMITTED',
    async (transactionalEntityManager) => {
    const result = await transactionalEntityManager.save(User, admin);
    
    // Force flush to ensure data is written
    await transactionalEntityManager.query('SELECT 1'); // Force connection sync
    
    // Wait a bit to ensure transaction is committed
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Immediately verify it was saved using the SAME connection
    const verify = await transactionalEntityManager
      .createQueryBuilder(User, 'user')
      .where('user.id = :id', { id: result.id })
      .andWhere('user.deletedAt IS NULL')
      .select(['user.id', 'user.email', 'user.passwordHash', 'user.roles'])
      .getOne();
    
    if (!verify) {
      throw new Error('❌ User was not saved to database!');
    }
    
    if (!verify.passwordHash) {
      throw new Error('❌ Password hash was not saved!');
    }
    
    // Double-check by querying directly
    const directCheck = await transactionalEntityManager.query(
      'SELECT id, email, "passwordHash" IS NOT NULL as has_password FROM users WHERE id = $1 AND "deletedAt" IS NULL',
      [result.id]
    );
    
    if (directCheck.length === 0) {
      throw new Error('❌ User not found in direct query!');
    }
    
    console.log('✅ [Seed] Direct database query verified:', {
      id: directCheck[0].id,
      email: directCheck[0].email,
      hasPassword: directCheck[0].has_password,
    });
    
    return result;
  });
  
  // Final verification after transaction commit
  await new Promise(resolve => setTimeout(resolve, 200)); // Wait for commit
  
  const finalVerify = await userRepo
    .createQueryBuilder('user')
    .where('user.id = :id', { id: savedAdmin.id })
    .andWhere('user.deletedAt IS NULL')
    .select(['user.id', 'user.email', 'user.passwordHash', 'user.roles'])
    .getOne();
  
  if (!finalVerify) {
    throw new Error('❌ User not found after transaction commit!');
  }
  
  console.log('✅ [Seed] Admin user created and verified:', {
    id: savedAdmin.id,
    email: savedAdmin.email,
    hasPasswordHash: !!savedAdmin.passwordHash,
    roles: savedAdmin.roles,
  });
  
  console.log('✅ [Seed] Final verification after commit:', {
    id: finalVerify.id,
    email: finalVerify.email,
    hasPasswordHash: !!finalVerify.passwordHash,
    roles: finalVerify.roles,
  });

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('✅ Admin user seeded successfully:');
  console.log(`   Email: ${email}`);
  console.log(`   Password: ${plainPassword}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  await AppDataSource.destroy();
  console.log('✅ [Seed] Database connection closed');
}

seedAdmin().catch((err) => {
  console.error('Failed to seed admin user', err);
  process.exit(1);
});


