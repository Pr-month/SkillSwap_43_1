import 'dotenv/config';
import * as bcrypt from 'bcrypt';
import { User } from '../users/entities/user.entity';
import { AppDataSource } from './data-source';
import { USERS_DATA } from './data/users.data';

export async function seedUsers(): Promise<void> {
  await AppDataSource.initialize();

  try {
    const userRepository = AppDataSource.getRepository(User);

    for (const userData of USERS_DATA) {
      const count = await userRepository.count({
        where: { email: userData.email },
      });

      if (count > 0) {
        console.log(`User ${userData.email} already exists, skipping...`);
        continue;
      }

      const hashedPassword = await bcrypt.hash(userData.password, 10);

      const user = userRepository.create({
        ...userData,
        password: hashedPassword,
      });

      await userRepository.save(user);
      console.log(`User ${userData.email} created successfully`);
    }
  } finally {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
  }
}

if (require.main === module) {
  void seedUsers();
}
