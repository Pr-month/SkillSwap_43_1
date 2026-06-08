import {AppDataSource} from "../config/database.config";
import {Skill} from "../skills/entities/skill.entity";
import {skillSeedData} from "./data/seed.skills.data";
import {Category} from "../categories/entities/category.entity";

export async function seedSkills () {
    await AppDataSource.initialize();
    const skillRepo = AppDataSource.getRepository(Skill);
    const categoriesRepo = AppDataSource.getRepository(Category);

    const skillsCount = await skillRepo.count();
    if (skillsCount > 0 ) {
        console.log('Сидинг навыков пропущен');
        return;
    }

    const categories = await categoriesRepo.find();
    const categoryMap = new Map();
    categories.forEach(cat => {
        categoryMap.set(cat.id, cat);
    });

    let createdCount = 0;
    let skippedCount = 0;

    for (const skillData of skillSeedData) {
        const category = categoryMap.get(skillData.categoryId);

        if (!category) {
            console.warn(`⚠️ Категория с ID ${skillData.categoryId} не найдена, навык пропущен: ${skillData.title}`);
            skippedCount++;
            continue;
        }

        const newSkill = skillRepo.create({
            title: skillData.title,
            description: skillData.description,
            category: category, // ← передаем объект Category
            images: skillData.images,
            // owner, wantToLearnBy, favoriteBy пока оставляем пустыми или undefined
        });

        await skillRepo.save(newSkill);
        createdCount++;
        console.log(`✅ Создан навык: ${skillData.title}`);
    }

    console.log(`Сидинг навыков завершен: создано ${createdCount}, пропущено ${skippedCount}`);
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