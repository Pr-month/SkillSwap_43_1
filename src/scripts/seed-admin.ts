import 'dotenv/config';
import * as bcrypt from 'bcrypt';
import { User } from '../users/entities/user.entity';
import { AppDataSource } from './data-source';
import { ADMIN_DATA } from './data/users.data';

async function seedAdmin(): Promise<void> {
  await AppDataSource.initialize();

  try {
    const userRepository = AppDataSource.getRepository(User);

    const count = await userRepository.count({
      where: { email: ADMIN_DATA.email },
    });

    if (count > 0) {
      console.log('Admin already exists, skipping...');
      return;
    }

    const hashedPassword = await bcrypt.hash(ADMIN_DATA.password, 10);

    const admin = userRepository.create({
      ...ADMIN_DATA,
      password: hashedPassword,
    });

    await userRepository.save(admin);
    console.log('Admin created successfully');
  } finally {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
  }
}

void seedAdmin();
