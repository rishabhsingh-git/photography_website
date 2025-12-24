import 'reflect-metadata';
import { AppDataSource } from '../data-source';
import { User } from '../infrastructure/database/entities/user.entity';
import { getConnection } from 'typeorm';

async function compareConnections() {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🔍 Comparing database connections...');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  await AppDataSource.initialize();
  
  const email = 'rishabhsingh4554@gmail.com';
  
  // Check connection info from AppDataSource
  const queryRunner = AppDataSource.createQueryRunner();
  await queryRunner.connect();
  
  const dbInfo = await queryRunner.query(`
    SELECT 
      current_database() as database,
      current_user as user,
      inet_server_addr() as server_ip,
      inet_server_port() as server_port,
      version() as version
  `);
  
  console.log('\n📊 AppDataSource Connection Info:');
  console.log('   Database:', dbInfo[0].database);
  console.log('   User:', dbInfo[0].user);
  console.log('   Server IP:', dbInfo[0].server_ip || 'localhost');
  console.log('   Server Port:', dbInfo[0].server_port);
  
  // Get all admin users
  const userRepo = AppDataSource.getRepository(User);
  const allAdmins = await userRepo
    .createQueryBuilder('user')
    .where("user.roles @> ARRAY['admin']::users_roles_enum[]")
    .withDeleted() // Include soft-deleted
    .orderBy('user.createdAt', 'DESC')
    .getMany();
  
  console.log('\n👥 All Admin Users Found:');
  if (allAdmins.length === 0) {
    console.log('   ⚠️  No admin users found!');
  } else {
    allAdmins.forEach((admin, idx) => {
      console.log(`\n   ${idx + 1}. Admin User:`);
      console.log(`      ID: ${admin.id}`);
      console.log(`      Email: ${admin.email}`);
      console.log(`      Created: ${admin.createdAt}`);
      console.log(`      Deleted: ${admin.deletedAt || 'No'}`);
      console.log(`      Has Password: ${!!admin.passwordHash}`);
    });
  }
  
  // Check for the specific email
  const specificUser = await userRepo
    .createQueryBuilder('user')
    .where('user.email = :email', { email })
    .withDeleted()
    .getOne();
  
  if (specificUser) {
    console.log('\n🎯 Specific User Check:');
    console.log('   ID:', specificUser.id);
    console.log('   Email:', specificUser.email);
    console.log('   Created:', specificUser.createdAt);
    console.log('   Deleted:', specificUser.deletedAt || 'No');
    console.log('   Has Password:', !!specificUser.passwordHash);
    
    // Try to read passwordHash
    const userWithPassword = await userRepo
      .createQueryBuilder('user')
      .where('user.id = :id', { id: specificUser.id })
      .select(['user.id', 'user.email', 'user.passwordHash'])
      .getOne();
    
    console.log('   Password Hash Present:', !!userWithPassword?.passwordHash);
  } else {
    console.log('\n⚠️  User not found with email:', email);
  }
  
  // Check connection string
  console.log('\n🔌 Connection Configuration:');
  console.log('   DATABASE_URL:', process.env.DATABASE_URL ? 'Set' : 'Not set');
  console.log('   DB_HOST:', process.env.DB_HOST || 'Not set');
  console.log('   DB_NAME:', process.env.DB_NAME || 'Not set');
  console.log('   DB_USER:', process.env.DB_USER || 'Not set');
  
  await queryRunner.release();
  await AppDataSource.destroy();
  
  console.log('\n✅ Connection comparison complete');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
}

compareConnections().catch((err) => {
  console.error('❌ Error:', err);
  process.exit(1);
});

