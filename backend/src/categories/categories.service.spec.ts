import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Category } from './entities/category.entity';

describe('CategoriesService', () => {
  let service: CategoriesService;
  let repository: Repository<Category>;

  const mockRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    delete: jest.fn(),
  };

  const testCategories: Category[] = [
    {
      id: '00000000-0000-0000-0000-00000000000a',
      name: 'Категория А',
      parent: null,
      children: [
        {
          id: '00000000-0000-0000-0000-00000000000b',
          name: 'Категория B',
          parent: {
            id: '00000000-0000-0000-0000-00000000000a',
            name: 'Категория A',
            parent: null,
            children: [],
          },
          children: [],
        },
      ],
    },
    {
      id: '00000000-0000-0000-0000-00000000000c',
      name: 'Категория C',
      parent: null,
      children: [],
    },
  ];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategoriesService,
        {
          provide: getRepositoryToken(Category),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<CategoriesService>(CategoriesService);
    repository = module.get<Repository<Category>>(getRepositoryToken(Category));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('all mocks should be defined', () => {
    expect(service).toBeDefined();
    expect(repository).toBeDefined();
  });

  describe('getCategories', () => {
    it('should return all root categories with children', async () => {
      mockRepository.find.mockResolvedValue(testCategories);

      const result = await service.getCategories();

      expect(mockRepository.find).toHaveBeenCalledWith({
        where: { parent: IsNull() },
        relations: ['children'],
      });
      expect(mockRepository.find).toHaveBeenCalledTimes(1);
      expect(result).toEqual(testCategories);
    });

    it('should return empty array when no categories exist', async () => {
      mockRepository.find.mockResolvedValue([]);

      const result = await service.getCategories();

      expect(result).toHaveLength(0);
      expect(mockRepository.find).toHaveBeenCalledTimes(1);
    });
  });

  describe('createCategory', () => {
    it('should create a category with no parent', async () => {
      const createRequest: CreateCategoryDto = {
        name: 'Созданная категория',
        parentId: null,
      };
      const savedCategory: Category = {
        id: '00000000-0000-0000-0000-000000000000',
        name: 'Созданная категория',
        parent: null,
        children: [],
      };
      mockRepository.create.mockReturnValue(savedCategory);
      mockRepository.save.mockResolvedValue(savedCategory);

      const result = await service.createCategory(createRequest);

      expect(result).toEqual(savedCategory);
      expect(mockRepository.create).toHaveBeenCalledWith({
        name: 'Созданная категория',
        parent: null,
      });
      expect(mockRepository.save).toHaveBeenCalledWith(savedCategory);
      expect(mockRepository.create).toHaveBeenCalledTimes(1);
      expect(mockRepository.save).toHaveBeenCalledTimes(1);
    });

    it('should create a category with valid parent ID', async () => {
      const createRequest: CreateCategoryDto = {
        name: 'Созданная категория',
        parentId: testCategories[0].id,
      };
      const savedCategory: Category = {
        id: '00000000-0000-0000-0000-000000000000',
        name: 'Созданная категория',
        parent: null,
        children: [],
      };

      mockRepository.findOne.mockResolvedValue(testCategories[0]);
      mockRepository.create.mockReturnValue(createRequest);
      mockRepository.save.mockResolvedValue(savedCategory);

      const result = await service.createCategory(createRequest);

      expect(result).toEqual(savedCategory);
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: testCategories[0].id },
      });
      expect(mockRepository.create).toHaveBeenCalledWith({
        name: 'Созданная категория',
        parent: testCategories[0],
      });
      expect(mockRepository.save).toHaveBeenCalledWith({
        name: savedCategory.name,
        parentId: testCategories[0].id,
      });
      expect(mockRepository.findOne).toHaveBeenCalledTimes(1);
      expect(mockRepository.create).toHaveBeenCalledTimes(1);
      expect(mockRepository.save).toHaveBeenCalledTimes(1);
    });

    it('should throw NotFoundException when parent category does not exist', async () => {
      const createRequest: CreateCategoryDto = {
        name: 'Созданная категория',
        parentId: '00000000-0000-0000-0000-000000000404',
      };
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.createCategory(createRequest)).rejects.toThrow(
        new NotFoundException(
          `Parent category with ID ${createRequest.parentId} is not found in the database!`,
        ),
      );
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: createRequest.parentId },
      });
      expect(mockRepository.findOne).toHaveBeenCalledTimes(1);
      expect(mockRepository.create).not.toHaveBeenCalled();
      expect(mockRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('updateCategory', () => {
    it('should update category successfully without parent', async () => {
      const existingCategory: Category = testCategories[1];
      const updateRequest: UpdateCategoryDto = {
        name: 'Обновленная категория',
        parentId: null,
      };
      const updatedCategory: Category = {
        ...existingCategory,
        name: updateRequest.name,
      };

      mockRepository.findOne.mockResolvedValue(existingCategory);
      mockRepository.save.mockResolvedValue(updatedCategory);

      const result = await service.updateCategory(
        existingCategory.id,
        updateRequest,
      );

      expect(result).toEqual(updatedCategory);
      expect(existingCategory.name).toBe(updateRequest.name);
      expect(existingCategory.parent).toBeNull();
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: existingCategory.id },
      });
      expect(mockRepository.save).toHaveBeenCalledWith(existingCategory);
      expect(mockRepository.findOne).toHaveBeenCalledTimes(1);
      expect(mockRepository.save).toHaveBeenCalledTimes(1);
    });

    it('should update category with new parent', async () => {
      const existingCategory: Category = testCategories[0];
      const parentCategory: Category = testCategories[1];
      const updateRequest: UpdateCategoryDto = {
        name: 'Обновленная категория',
        parentId: testCategories[1].id,
      };
      const updatedCategory: Category = {
        ...existingCategory,
        name: updateRequest.name,
        parent: parentCategory,
      };

      mockRepository.findOne.mockResolvedValueOnce(existingCategory);
      mockRepository.findOne.mockResolvedValueOnce(parentCategory);
      mockRepository.save.mockResolvedValue(updatedCategory);

      const result = await service.updateCategory(
        existingCategory.id,
        updateRequest,
      );

      expect(result).toEqual(updatedCategory);
      expect(existingCategory.name).toBe(updateRequest.name);
      expect(existingCategory.parent).toBe(parentCategory);
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: existingCategory.id },
      });
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: parentCategory.id },
      });
      expect(mockRepository.save).toHaveBeenCalledWith(existingCategory);
      expect(mockRepository.findOne).toHaveBeenCalledTimes(2);
      expect(mockRepository.save).toHaveBeenCalledTimes(1);
    });

    it('should throw NotFoundException when category to update not found', async () => {
      const updateRequest: UpdateCategoryDto = {
        name: 'Обновленная категория',
        parentId: null,
      };
      const notFoundId = '00000000-0000-0000-0000-000000000404';

      mockRepository.findOne.mockResolvedValueOnce(null);

      await expect(
        service.updateCategory(notFoundId, updateRequest),
      ).rejects.toThrow(
        new NotFoundException(
          `Category with ID ${notFoundId} is not found in the database!`,
        ),
      );
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: notFoundId },
      });
      expect(mockRepository.findOne).toHaveBeenCalledTimes(1);
      expect(mockRepository.save).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException when parent category not found', async () => {
      const existingCategory: Category = testCategories[0];
      const notFoundId = '00000000-0000-0000-0000-000000000404';
      const updateRequest: UpdateCategoryDto = {
        name: 'Обновленная категория',
        parentId: notFoundId,
      };

      mockRepository.findOne.mockResolvedValueOnce(existingCategory);
      mockRepository.findOne.mockResolvedValueOnce(null);

      await expect(
        service.updateCategory(existingCategory.id, updateRequest),
      ).rejects.toThrow(
        new NotFoundException(
          `Parent category with ID ${notFoundId} is not found in the database!`,
        ),
      );
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: existingCategory.id },
      });
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: notFoundId },
      });
      expect(mockRepository.findOne).toHaveBeenCalledTimes(2);
      expect(mockRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('deleteCategory', () => {
    it('should delete existing category successfully', async () => {
      const categoryToDelete = testCategories[0];
      const deleteResult = { affected: 1, raw: {} };

      mockRepository.findOne.mockResolvedValue(categoryToDelete);
      mockRepository.delete.mockResolvedValue(deleteResult);

      const result = await service.deleteCategory(categoryToDelete.id);

      expect(result).toEqual(deleteResult);
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: categoryToDelete.id },
      });
      expect(mockRepository.delete).toHaveBeenCalledWith(categoryToDelete.id);
      expect(mockRepository.findOne).toHaveBeenCalledTimes(1);
      expect(mockRepository.delete).toHaveBeenCalledTimes(1);
    });

    it('should throw NotFoundException when category to delete not found', async () => {
      const notFoundId = '00000000-0000-0000-0000-000000000404';

      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.deleteCategory(notFoundId)).rejects.toThrow(
        new NotFoundException(
          `Category with ID ${notFoundId} is not found in the database!`,
        ),
      );
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: notFoundId },
      });
      expect(mockRepository.findOne).toHaveBeenCalledTimes(1);
      expect(mockRepository.delete).not.toHaveBeenCalled();
    });
  });
});
