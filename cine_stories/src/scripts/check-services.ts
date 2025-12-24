import 'reflect-metadata';
import { AppDataSource } from '../data-source';
import { Service } from '../infrastructure/database/entities/service.entity';
import { IsNull } from 'typeorm';

async function checkServices() {
  console.log('🔍 Checking services in database...');
  
  await AppDataSource.initialize();
  const serviceRepo = AppDataSource.getRepository(Service);

  // Get all services (including soft-deleted)
  const allServices = await serviceRepo
    .createQueryBuilder('service')
    .withDeleted() // Include soft-deleted
    .getMany();

  console.log(`\n📊 Total services (including deleted): ${allServices.length}`);

  // Get non-deleted services
  const activeServices = await serviceRepo.find({
    where: { deletedAt: IsNull(), isActive: true },
  });

  const inactiveServices = await serviceRepo.find({
    where: { deletedAt: IsNull(), isActive: false },
  });

  const deletedServices = allServices.filter(s => s.deletedAt !== null);

  console.log(`✅ Active services: ${activeServices.length}`);
  console.log(`⏸️  Inactive services: ${inactiveServices.length}`);
  console.log(`🗑️  Soft-deleted services: ${deletedServices.length}`);

  if (allServices.length > 0) {
    console.log('\n📋 All Services:');
    allServices.forEach((s, idx) => {
      const status = s.deletedAt ? '🗑️ DELETED' : (s.isActive ? '✅ ACTIVE' : '⏸️ INACTIVE');
      console.log(`  ${idx + 1}. [${status}] "${s.title}" - Price: ₹${s.price}, ID: ${s.id}`);
      if (s.deletedAt) {
        console.log(`      Deleted at: ${s.deletedAt}`);
      }
    });
  } else {
    console.log('\n⚠️  No services found in database!');
    console.log('   → Create services via admin panel at /admin/services');
  }

  await AppDataSource.destroy();
}

checkServices().catch((err) => {
  console.error('❌ Error checking services:', err);
  process.exit(1);
});

