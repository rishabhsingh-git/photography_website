import 'reflect-metadata';
import { AppDataSource } from '../data-source';
import { User, AuthProvider, UserRole } from '../infrastructure/database/entities/user.entity';
import * as argon2 from 'argon2';

async function seedAdmin() {
  await AppDataSource.initialize();

  const userRepo = AppDataSource.getRepository(User);

  const email = 'rishabhsingh4554@gmail.com';
  const plainPassword = 'Rishabh4554@';

  // Delete existing admin user if it exists
  const existingAdmin = await userRepo.findOne({ where: { email } });
  console.log('existingAdmin******************************************************************************', existingAdmin);
  if (existingAdmin) {
    console.log('Deleting existing admin user...');
    await userRepo.remove(existingAdmin);
    console.log('✅ Existing admin user deleted');
  }

  // Create new admin user
  const admin = userRepo.create({
    email,
    passwordHash: await argon2.hash(plainPassword),
    provider: AuthProvider.LOCAL,
    roles: [UserRole.ADMIN],
    phone: '7020402206',
    address: '123, Main St, Anytown, USA',
    name: 'Rishabh Singh',
    oauthId: '7020402206',
  });

  const savedAdmin = await userRepo.save(admin);
  
  // Verify passwordHash was saved
  const verifyUser = await userRepo.findOne({
    where: { email },
    select: ['id', 'email', 'passwordHash'],
  });
  
  if (!verifyUser?.passwordHash) {
    throw new Error('❌ Password hash was not saved!');
  }
  
  console.log('✅ Password hash verified in database');

  console.log('✅ Admin user seeded:');
  console.log(`   Email: ${email}`);
  console.log(`   Password: ${plainPassword}`);

  await AppDataSource.destroy();
}

seedAdmin().catch((err) => {
  console.error('Failed to seed admin user', err);
  process.exit(1);
});


