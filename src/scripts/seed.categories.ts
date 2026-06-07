import { AppDataSource } from 'src/config/database.config';
import { CategoriesData } from './data/seed.categories.data';
import { Category } from 'src/skills/entities/category.entity';

export async function seedCategories() {
  await AppDataSource.initialize();

  const categoryRepo = AppDataSource.getRepository(Category);

  const categoriesCount = await categoryRepo.count();

  if (categoriesCount > 0) {
    console.log('Сидинг категорий пропущен');
    return;
  }

  for (const category of CategoriesData) {
    const newCategory = categoryRepo.create(category);
    await categoryRepo.save(newCategory);
  }
  console.log('Сидинг категорий завершен');
}

seedCategories()
  .catch((error) => {
    console.log('Ошибка при сидинге категорий', error);
  })
  .finally(() => {
    if (AppDataSource.isInitialized) {
      void AppDataSource.destroy();
    }
  });
