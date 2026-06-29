import { AppDataSource } from 'src/config/database.config';
import { CategoriesData } from './data/seed.categories.data';
import { Category } from 'src/categories/entities/category.entity';

export async function seedCategories() {
  if (!AppDataSource.isInitialized) {
    await AppDataSource.initialize();
  }

  const categoryRepo = AppDataSource.getRepository(Category);

  const categoriesCount = await categoryRepo.count();

  if (categoriesCount > 0) {
    console.log('Сидинг категорий пропущен');
    return;
  }

  const parentCategoriesMap = new Map<string, string>();

  for (const category of CategoriesData) {
    const parentCategory = categoryRepo.create({ name: category.name });
    const savedParentCategory = await categoryRepo.save(parentCategory);
    parentCategoriesMap.set(category.name, savedParentCategory.id);
  }

  for (const category of CategoriesData) {
    const parentCategoryId = parentCategoriesMap.get(category.name);

    if (!parentCategoryId) {
      continue;
    }

    for (const childName of category.children) {
      const childCategory = categoryRepo.create({
        name: childName,
        parent: { id: parentCategoryId } as Category,
      });
      await categoryRepo.save(childCategory);
    }
  }
  console.log('Сидинг категорий завершен');
}

if (require.main === module) {
  seedCategories()
    .catch((error) => {
      console.log('Ошибка при сидинге категорий', error);
    })
    .finally(() => {
      if (AppDataSource.isInitialized) {
        void AppDataSource.destroy();
      }
    });
}
