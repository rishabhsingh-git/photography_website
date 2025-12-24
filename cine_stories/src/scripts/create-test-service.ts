import 'reflect-metadata';
import { AppDataSource } from '../data-source';
import { Service } from '../infrastructure/database/entities/service.entity';

async function createTestService() {
  console.log('🚀 Creating test service...');
  
  await AppDataSource.initialize();
  const serviceRepo = AppDataSource.getRepository(Service);

  // Check if test service already exists
  const existing = await serviceRepo.findOne({ where: { title: 'Wedding Photography' } });
  if (existing) {
    console.log('✅ Test service already exists, updating...');
    existing.isActive = true;
    await serviceRepo.save(existing);
    console.log('✅ Test service activated!');
    await AppDataSource.destroy();
    return;
  }

  const testService = serviceRepo.create({
    title: 'Wedding Photography',
    slogan: 'Capture your special day',
    description: 'Professional wedding photography services to make your day unforgettable.',
    highlights: [
      'Full day coverage',
      'Edited photos',
      'Online gallery',
      'Print rights included'
    ],
    price: 50000,
    discountedPrice: 45000,
    isActive: true,
    imageUrl: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=800',
    icon: '💒',
  });

  await serviceRepo.save(testService);
  console.log('✅ Test service created successfully!');
  console.log('   Title:', testService.title);
  console.log('   Price: ₹', testService.price);
  console.log('   Active:', testService.isActive);

  await AppDataSource.destroy();
}

createTestService().catch((err) => {
  console.error('❌ Failed to create test service:', err);
  process.exit(1);
});

