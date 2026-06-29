import 'dotenv/config';
import * as bcrypt from 'bcrypt';
import { In } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { AppDataSource } from './data-source';
import { USERS_DATA } from './data/users.data';
import { City } from '../cities/entities/city.entity';
import { fillDatabaseCities } from './seed-cities';

export async function seedUsers(): Promise<void> {
  await AppDataSource.initialize();

  try {
    const userRepository = AppDataSource.getRepository(User);
    const cityRepository = AppDataSource.getRepository(City);

    const userEmails = USERS_DATA.map((user) => user.email);
    const count = await userRepository.count({
      where: { email: In(userEmails) },
    });
    if (count > 0) {
      console.log(`Users already exists, skipping...`);
      return;
    }

    await fillDatabaseCities();
    const randomCities = await cityRepository
      .createQueryBuilder('city')
      .orderBy('RANDOM()')
      .limit(USERS_DATA.length)
      .getMany();

    const userEntities = await Promise.all(
      USERS_DATA.map(async (user, index) => {
        const hashedPassword = await bcrypt.hash(user.password, 10);
        return userRepository.create({
          ...user,
          password: hashedPassword,
          city: randomCities[index],
        });
      }),
    );

    await userRepository.save(userEntities);
  } finally {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
  }
}

if (require.main === module) {
  void seedUsers();
}
