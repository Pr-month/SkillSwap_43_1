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
import { ApiTags } from '@nestjs/swagger';
import { DeleteResult } from 'typeorm';
import { Roles } from '../auth/decorators/role.decorator';
import { AccessTokenGuard } from '../auth/guards/accessToken.guard';
import { RolesGuard } from '../auth/guards/role.guard';
import { Role } from '../users/entities/user.enums';
import { CategoriesService } from './categories.service';
import {
  ApiCategoriesCreate,
  ApiCategoriesDelete,
  ApiCategoriesGetAll,
  ApiCategoriesUpdate,
} from './docs/categories.swagger';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Category } from './entities/category.entity';

@ApiTags('categories')
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @ApiCategoriesGetAll()
  @Get()
  getCategories(): Promise<Category[]> {
    return this.categoriesService.getCategories();
  }

  @ApiCategoriesCreate()
  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles([Role.ADMIN])
  @Post()
  createCategory(
    @Body() createCategoryDto: CreateCategoryDto,
  ): Promise<Category> {
    return this.categoriesService.createCategory(createCategoryDto);
  }

  @ApiCategoriesUpdate()
  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles([Role.ADMIN])
  @Patch(':id')
  updateCategory(
    @Param('id') categoryId: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ): Promise<Category> {
    return this.categoriesService.updateCategory(categoryId, updateCategoryDto);
  }

  @ApiCategoriesDelete()
  @UseGuards(AccessTokenGuard, RolesGuard)
  @Roles([Role.ADMIN])
  @Delete(':id')
  deleteCategory(@Param('id') categoryId: string): Promise<DeleteResult> {
    return this.categoriesService.deleteCategory(categoryId);
  }
}
