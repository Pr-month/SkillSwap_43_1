import 'dotenv/config';
import * as bcrypt from 'bcrypt';
import { User } from '../users/entities/user.entity';
import { AppDataSource } from './data-source';
import { ADMIN_DATA } from './data/users.data';
import { City } from '../cities/entities/city.entity';
import { fillDatabaseCities } from './seed-cities';

export async function seedAdmin(): Promise<void> {
  if (!AppDataSource.isInitialized) {
    await AppDataSource.initialize();
  }

  try {
    const userRepository = AppDataSource.getRepository(User);
    const cityRepository = AppDataSource.getRepository(City);

    const count = await userRepository.count({
      where: { email: ADMIN_DATA.email },
    });

    if (count > 0) {
      console.log('Admin already exists, skipping...');
      return;
    }

    await fillDatabaseCities();
    const exampleCity = await cityRepository.findOne({
      where: { name: 'Москва' },
    });
    ADMIN_DATA.city = exampleCity as City;

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

if (require.main === module) {
  void seedAdmin();
}
