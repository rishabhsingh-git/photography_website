import 'reflect-metadata';
import { AppDataSource } from '../data-source';
import { Service } from '../infrastructure/database/entities/service.entity';
import { User } from '../infrastructure/database/entities/user.entity';
import { IsNull } from 'typeorm';

async function verifyConnection() {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🔍 Verifying database connection...');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  try {
    await AppDataSource.initialize();
    console.log('✅ Database connection established');
    
    // Test query
    const serviceRepo = AppDataSource.getRepository(Service);
    const userRepo = AppDataSource.getRepository(User);
    
    const serviceCount = await serviceRepo.count({ where: { deletedAt: IsNull() } });
    const userCount = await userRepo.count({ where: { deletedAt: IsNull() } });
    const adminCount = await userRepo.count({ 
      where: { 
        deletedAt: IsNull(),
        roles: ['admin'] as any,
      } 
    });
    
    console.log('\n📊 Database Statistics:');
    console.log(`   Services: ${serviceCount}`);
    console.log(`   Users: ${userCount}`);
    console.log(`   Admins: ${adminCount}`);
    
    // Check connection info
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    const result = await queryRunner.query('SELECT current_database(), current_user, version()');
    console.log('\n🔌 Connection Info:');
    console.log(`   Database: ${result[0].current_database}`);
    console.log(`   User: ${result[0].current_user}`);
    console.log(`   PostgreSQL: ${result[0].version.split(' ')[0]} ${result[0].version.split(' ')[1]}`);
    await queryRunner.release();
    
    console.log('\n✅ Database connection verified successfully!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    await AppDataSource.destroy();
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    process.exit(1);
  }
}

verifyConnection();

