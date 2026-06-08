import { AccessTokenGuard } from '../auth/guards/accessToken.guard';
import { RolesGuard } from '../auth/guards/role.guard';
import { Roles } from '../auth/decorators/role.decorator';
import { Role } from '../users/entities/user.enums';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { DeleteResult } from 'typeorm';
import { CategoriesService } from './categories.service';
import { Category } from './entities/category.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  getCategories(): Promise<Category[]> {
    return this.categoriesService.getCategories();
  }

  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles([Role.ADMIN])
  @Post()
  createCategory(
    @Body() createCategoryDto: CreateCategoryDto,
  ): Promise<Category> {
    return this.categoriesService.createCategory(createCategoryDto);
  }

  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles([Role.ADMIN])
  @Patch(':id')
  updateCategory(
    @Param('id') categoryId: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ): Promise<Category> {
    return this.categoriesService.updateCategory(categoryId, updateCategoryDto);
  }

  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles([Role.ADMIN])
  @Delete(':id')
  deleteCategory(@Param('id') categoryId: string): Promise<DeleteResult> {
    return this.categoriesService.deleteCategory(categoryId);
  }
}
