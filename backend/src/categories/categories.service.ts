import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { DeleteResult } from 'typeorm/browser';
import { Category } from './entities/category.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private readonly categoriesRepository: Repository<Category>,
  ) {}

  async getCategories(): Promise<Category[]> {
    return this.categoriesRepository.find({
      where: { parent: IsNull() },
      relations: ['children'],
    });
  }

  async createCategory(createRequest: CreateCategoryDto): Promise<Category> {
    const { name, parentId } = createRequest;
    let parentCategory: Category | null = null;

    if (parentId) {
      parentCategory = await this.categoriesRepository.findOne({
        where: { id: parentId },
      });
      if (!parentCategory) {
        throw new NotFoundException(
          `Parent category with ID ${parentId} is not found in the database!`,
        );
      }
    }

    const createdCategory = this.categoriesRepository.create({
      name: name,
      parent: parentCategory,
    });

    return this.categoriesRepository.save(createdCategory);
  }

  async updateCategory(
    categoryId: string,
    updateRequest: UpdateCategoryDto,
  ): Promise<Category> {
    const { name, parentId } = updateRequest;
    let parentCategory: Category | null = null;

    const updCategory = await this.categoriesRepository.findOne({
      where: { id: categoryId },
    });
    if (!updCategory) {
      throw new NotFoundException(
        `Category with ID ${categoryId} is not found in the database!`,
      );
    }

    if (parentId) {
      parentCategory = await this.categoriesRepository.findOne({
        where: { id: parentId },
      });
      if (!parentCategory) {
        throw new NotFoundException(
          `Parent category with ID ${parentId} is not found in the database!`,
        );
      }
    }

    updCategory.name = name;
    updCategory.parent = parentCategory;

    return this.categoriesRepository.save(updCategory);
  }

  async deleteCategory(categoryId: string): Promise<DeleteResult> {
    const delCategory = await this.categoriesRepository.findOne({
      where: { id: categoryId },
    });
    if (!delCategory) {
      throw new NotFoundException(
        `Category with ID ${categoryId} is not found in the database!`,
      );
    }

    return this.categoriesRepository.delete(categoryId);
  }
}
