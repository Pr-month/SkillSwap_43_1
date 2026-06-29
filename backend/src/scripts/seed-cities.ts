import 'dotenv/config';
import { City } from '../cities/entities/city.entity';
import { AppDataSource } from './data-source';
import { CITIES_DATA } from './data/seed.cities.data';

export async function fillDatabaseCities(): Promise<void> {
  const cityRepository = AppDataSource.getRepository(City);

  const cityCount = await cityRepository.count();
  if (cityCount > 0) {
    console.log('В таблице присутствуют данные, сидинг городов пропущен');
    return;
  }

  const cityEntities: City[] = CITIES_DATA.map((city) => {
    return cityRepository.create({
      latitude: parseFloat(city.coords.lat),
      longitude: parseFloat(city.coords.lon),
      district: city.district,
      name: city.name,
      population: city.population,
      subject: city.subject,
    });
  });

  await cityRepository.save(cityEntities);
}

export async function seedCities(): Promise<void> {
  if (!AppDataSource.isInitialized) {
    await AppDataSource.initialize();
  }

  try {
    await fillDatabaseCities();
    console.log('Cities created successfully');
  } finally {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
  }
}

if (require.main === module) {
  void seedCities();
}
