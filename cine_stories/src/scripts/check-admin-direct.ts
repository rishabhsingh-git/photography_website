import 'reflect-metadata';
import { AppDataSource } from '../data-source';
import { User } from '../infrastructure/database/entities/user.entity';
import { IsNull } from 'typeorm';

async function checkAdminDirect() {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🔍 Checking admin user directly in database...');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  console.log('\n📊 Environment Variables:');
  console.log('   DATABASE_URL:', process.env.DATABASE_URL ? 'SET' : 'NOT SET');
  if (process.env.DATABASE_URL) {
    // Mask password in URL
    const maskedUrl = process.env.DATABASE_URL.replace(/:[^:@]+@/, ':****@');
    console.log('   DATABASE_URL (masked):', maskedUrl);
  }
  console.log('   DB_HOST:', process.env.DB_HOST || 'NOT SET');
  console.log('   DB_NAME:', process.env.DB_NAME || 'NOT SET');
  
  await AppDataSource.initialize();
  console.log('\n✅ Database connection initialized');
  
  const queryRunner = AppDataSource.createQueryRunner();
  await queryRunner.connect();
  
  // Get database info
  const dbInfo = await queryRunner.query(`
    SELECT 
      current_database() as database,
      current_user as user,
      inet_server_addr() as server_ip,
      inet_server_port() as server_port
  `);
  
  console.log('\n📊 Database Connection Info:');
  console.log('   Database:', dbInfo[0].database);
  console.log('   User:', dbInfo[0].user);
  console.log('   Server IP:', dbInfo[0].server_ip || 'localhost');
  console.log('   Server Port:', dbInfo[0].server_port);
  
  const email = 'rishabhsingh4554@gmail.com';
  const normalizedEmail = email.toLowerCase().trim();
  
  console.log('\n🔍 Searching for admin user...');
  console.log('   Email:', email);
  console.log('   Normalized:', normalizedEmail);
  
  // Direct SQL query - exact match
  console.log('\n1️⃣ Direct SQL Query (exact match):');
  const exactMatch = await queryRunner.query(
    'SELECT id, email, "passwordHash" IS NOT NULL as has_password, "deletedAt" FROM users WHERE email = $1',
    [email]
  );
  console.log('   Result:', exactMatch.length > 0 ? 'FOUND' : 'NOT FOUND');
  if (exactMatch.length > 0) {
    console.log('   User:', {
      id: exactMatch[0].id,
      email: exactMatch[0].email,
      hasPassword: exactMatch[0].has_password,
      deletedAt: exactMatch[0].deletedAt,
    });
  }
  
  // Direct SQL query - normalized (lowercase)
  console.log('\n2️⃣ Direct SQL Query (lowercase):');
  const lowerMatch = await queryRunner.query(
    'SELECT id, email, "passwordHash" IS NOT NULL as has_password, "deletedAt" FROM users WHERE LOWER(email) = LOWER($1)',
    [email]
  );
  console.log('   Result:', lowerMatch.length > 0 ? 'FOUND' : 'NOT FOUND');
  if (lowerMatch.length > 0) {
    console.log('   User:', {
      id: lowerMatch[0].id,
      email: lowerMatch[0].email,
      hasPassword: lowerMatch[0].has_password,
      deletedAt: lowerMatch[0].deletedAt,
    });
  }
  
  // Get ALL users
  console.log('\n3️⃣ ALL Users in Database:');
  const allUsers = await queryRunner.query(
    'SELECT id, email, "passwordHash" IS NOT NULL as has_password, "deletedAt", roles FROM users ORDER BY "createdAt" DESC'
  );
  console.log(`   Total users: ${allUsers.length}`);
  allUsers.forEach((u: any, idx: number) => {
    console.log(`   ${idx + 1}. Email: "${u.email}"`);
    console.log(`      ID: ${u.id}`);
    console.log(`      Has Password: ${u.has_password}`);
    console.log(`      Deleted: ${u.deletedAt ? u.deletedAt : 'No'}`);
    console.log(`      Roles: ${JSON.stringify(u.roles)}`);
    console.log('');
  });
  
  // Check admin users specifically
  console.log('\n4️⃣ Admin Users (with roles check):');
  const adminUsers = await queryRunner.query(
    `SELECT id, email, "passwordHash" IS NOT NULL as has_password, "deletedAt", roles 
     FROM users 
     WHERE roles @> ARRAY['admin']::users_roles_enum[] 
     ORDER BY "createdAt" DESC`
  );
  console.log(`   Total admin users: ${adminUsers.length}`);
  adminUsers.forEach((u: any, idx: number) => {
    console.log(`   ${idx + 1}. Email: "${u.email}"`);
    console.log(`      ID: ${u.id}`);
    console.log(`      Has Password: ${u.has_password}`);
    console.log(`      Deleted: ${u.deletedAt ? u.deletedAt : 'No'}`);
  });
  
  // Try TypeORM query
  console.log('\n5️⃣ TypeORM Query (same as AuthService):');
  const userRepo = AppDataSource.getRepository(User);
  const typeormUser = await userRepo.findOne({
    where: { email: normalizedEmail, deletedAt: IsNull() },
    select: ['id', 'email', 'passwordHash', 'roles'],
  });
  console.log('   Result:', typeormUser ? 'FOUND' : 'NOT FOUND');
  if (typeormUser) {
    console.log('   User:', {
      id: typeormUser.id,
      email: typeormUser.email,
      hasPasswordHash: !!typeormUser.passwordHash,
      roles: typeormUser.roles,
    });
  }
  
  await queryRunner.release();
  await AppDataSource.destroy();
  
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('✅ Check complete');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
}

checkAdminDirect().catch((err) => {
  console.error('❌ Error:', err);
  process.exit(1);
});

