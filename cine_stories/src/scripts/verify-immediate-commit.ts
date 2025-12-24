import 'reflect-metadata';
import { AppDataSource } from '../data-source';
import { Service } from '../infrastructure/database/entities/service.entity';
import { User } from '../infrastructure/database/entities/user.entity';
import { IsNull } from 'typeorm';

async function verifyImmediateCommit() {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🔍 Verifying immediate database commit behavior...');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  await AppDataSource.initialize();
  
  const queryRunner = AppDataSource.createQueryRunner();
  await queryRunner.connect();
  
  // Check connection info
  const dbInfo = await queryRunner.query(`
    SELECT 
      current_database() as database,
      current_setting('transaction_isolation') as isolation_level,
      version() as version
  `);
  
  console.log('\n📊 Database Connection Info:');
  console.log('   Database:', dbInfo[0].database);
  console.log('   Isolation Level:', dbInfo[0].isolation_level);
  console.log('   PostgreSQL Version:', dbInfo[0].version.split(',')[0]);
  
  // Test transaction commit behavior
  console.log('\n🧪 Testing Transaction Commit Behavior...');
  
  const testServiceRepo = AppDataSource.getRepository(Service);
  
  // Create a test service in a transaction
  const testService = testServiceRepo.create({
    title: `TEST_COMMIT_${Date.now()}`,
    description: 'This is a test service to verify immediate commit',
    price: 999,
    isActive: true,
    deletedAt: null,
  });
  
  console.log('\n1️⃣ Creating test service in transaction...');
  const saved = await testServiceRepo.manager.transaction(
    'READ COMMITTED',
    async (transactionalEntityManager) => {
      const result = await transactionalEntityManager.save(Service, testService);
      console.log('   ✅ Service saved in transaction, ID:', result.id);
      
      // Verify within transaction
      const inTx = await transactionalEntityManager
        .createQueryBuilder(Service, 'service')
        .where('service.id = :id', { id: result.id })
        .getOne();
      
      console.log('   ✅ Verified within transaction:', inTx ? 'Found' : 'NOT FOUND');
      
      return result;
    }
  );
  
  // Wait a moment
  await new Promise(resolve => setTimeout(resolve, 100));
  
  // Verify after transaction commit
  console.log('\n2️⃣ Verifying after transaction commit...');
  const afterCommit = await testServiceRepo
    .createQueryBuilder('service')
    .where('service.id = :id', { id: saved.id })
    .getOne();
  
  if (afterCommit) {
    console.log('   ✅ Service found after commit:', {
      id: afterCommit.id,
      title: afterCommit.title,
    });
  } else {
    console.log('   ❌ Service NOT found after commit!');
  }
  
  // Direct SQL query
  console.log('\n3️⃣ Direct SQL query verification...');
  const directQuery = await queryRunner.query(
    'SELECT id, title, "isActive", "createdAt" FROM services WHERE id = $1',
    [saved.id]
  );
  
  if (directQuery.length > 0) {
    console.log('   ✅ Direct SQL query found service:', {
      id: directQuery[0].id,
      title: directQuery[0].title,
      isActive: directQuery[0].isActive,
      createdAt: directQuery[0].createdAt,
    });
  } else {
    console.log('   ❌ Direct SQL query did NOT find service!');
  }
  
  // Clean up test service
  console.log('\n4️⃣ Cleaning up test service...');
  await testServiceRepo.remove(saved);
  console.log('   ✅ Test service deleted');
  
  // Check current services count
  const servicesCount = await testServiceRepo.count({ where: { deletedAt: IsNull() } });
  const usersCount = await AppDataSource.getRepository(User).count({ where: { deletedAt: IsNull() } });
  
  console.log('\n📊 Current Database State:');
  console.log('   Active Services:', servicesCount);
  console.log('   Active Users:', usersCount);
  
  await queryRunner.release();
  await AppDataSource.destroy();
  
  console.log('\n✅ Verification complete');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
}

verifyImmediateCommit().catch((err) => {
  console.error('❌ Error:', err);
  process.exit(1);
});

