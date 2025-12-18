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
  if (existingAdmin) {
    console.log('Deleting existing admin user...');
    await userRepo.remove(existingAdmin);
    console.log('✅ Existing admin user deleted');
  }

  // Create new admin user
  const admin = userRepo.create({ email });

  admin.passwordHash = await argon2.hash(plainPassword);
  admin.provider = AuthProvider.LOCAL;
  admin.roles = [UserRole.ADMIN];
  admin.phone = '7020402206';
  admin.address = '123, Main St, Anytown, USA';
  admin.name = 'Rishabh Singh';
  admin.oauthId = '7020402206';
  admin.photos = [];
  admin.notifications = [];
  admin.payments = [];

  await userRepo.save(admin);

  console.log('✅ Admin user seeded:');
  console.log(`   Email: ${email}`);
  console.log(`   Password: ${plainPassword}`);

  await AppDataSource.destroy();
}

seedAdmin().catch((err) => {
  console.error('Failed to seed admin user', err);
  process.exit(1);
});


