import { AppDataSource } from './data-source';
import { Skill } from '../skills/entities/skill.entity';
import { skillSeedData } from './data/seed.skills.data';
import { Category } from '../categories/entities/category.entity';
import { User } from '../users/entities/user.entity';

const skillCategoryNames = new Map<string, string>([
  ['React с нуля до профи', 'Frontend'],
  ['Vue.js мастерство', 'Frontend'],
  ['Angular для enterprise', 'Frontend'],
  ['Next.js полный курс', 'Frontend'],
  ['Node.js Advanced', 'Backend'],
  ['Python Django', 'Backend'],
  ['Java Spring Boot', 'Backend'],
  ['Go для бэкенда', 'Backend'],
  ['Docker и Kubernetes', 'DevOps'],
  ['CI/CD pipelines', 'DevOps'],
  ['AWS Cloud Practitioner', 'DevOps'],
  ['React Native', 'Мобильная разработка'],
  ['Flutter с нуля', 'Мобильная разработка'],
  ['Unity Game Development', 'GameDev'],
  ['Unreal Engine 5', 'GameDev'],
  ['Figma для начинающих', 'UX/UI'],
  ['UX исследования', 'UX/UI'],
  ['Web-дизайн с нуля', 'Web-дизайн'],
  ['Adobe Photoshop мастерство', 'Графический дизайн'],
  ['Adobe Illustrator', 'Графический дизайн'],
  ['Разговорный английский', 'Английский язык'],
  ['Английский для IT', 'Английский язык'],
  ['Китайский для начинающих', 'Китайский язык'],
  ['Гитара для начинающих', 'Гитара'],
  ['Электрогитара', 'Гитара'],
  ['Фортепиано с нуля', 'Фортепиано'],
  ['Постановка голоса', 'Вокал'],
  ['SEO продвижение', 'SEO'],
  ['Таргетинг в Instagram', 'Таргетинг'],
  ['Agile и Scrum', 'Управление командой'],
  ['Маркетинговая стратегия', 'Маркетинг и реклама'],
  ['Мастерство продаж B2B', 'Продажи и переговоры'],
  ['Личный финансовый план', 'Личная финансовая грамотность'],
  ['Инвестиции для начинающих', 'Инвестиции'],
]);

export async function seedSkills() {
  if (!AppDataSource.isInitialized) {
    await AppDataSource.initialize();
  }

  const skillRepo = AppDataSource.getRepository(Skill);
  const categoriesRepo = AppDataSource.getRepository(Category);
  const usersRepo = AppDataSource.getRepository(User);

  const skillsCount = await skillRepo.count();
  if (skillsCount > 0) {
    console.log('Сидинг навыков пропущен');
    return;
  }

  const categories = await categoriesRepo.find();
  const categoryMap = new Map<string, Category>();
  categories.forEach((cat) => {
    categoryMap.set(cat.name, cat);
  });

  const users = await usersRepo.find({
    order: {
      email: 'ASC',
    },
  });

  if (categories.length === 0) {
    throw new Error('Нельзя создать навыки: в БД нет категорий. Сначала запустите seed:categories.');
  }

  if (users.length === 0) {
    throw new Error('Нельзя создать навыки: в БД нет пользователей. Сначала запустите seed:users.');
  }

  let createdCount = 0;
  let skippedCount = 0;

  for (const skillData of skillSeedData) {
    const categoryName = skillCategoryNames.get(skillData.title);

    if (!categoryName) {
      console.warn(
        `Категория для навыка не описана, навык пропущен: ${skillData.title}`,
      );
      skippedCount++;
      continue;
    }

    const category = categoryMap.get(categoryName);

    if (!category) {
      console.warn(
        `Категория "${categoryName}" не найдена в БД, навык пропущен: ${skillData.title}`,
      );
      skippedCount++;
      continue;
    }

    const owner = users[createdCount % users.length];

    const newSkill = skillRepo.create({
      title: skillData.title,
      description: skillData.description,
      category,
      images: skillData.images,
      owner,
    });

    await skillRepo.save(newSkill);
    createdCount++;
    console.log(`✅ Создан навык: ${skillData.title}`);
  }

  console.log(
    `Сидинг навыков завершен: создано ${createdCount}, пропущено ${skippedCount}`,
  );
}

seedSkills()
  .catch((err) => {
    console.log('Ошибка при сидинге навыков', err);
  })
  .finally(() => {
    if (AppDataSource.isInitialized) {
      void AppDataSource.destroy();
    }
  });
