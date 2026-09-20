import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UsePipes,
} from '@nestjs/common';

import { UserRole } from '@prisma/client';

import { Roles } from 'src/common/guards/access-control/roles.decorator';

import { ParseParamsPaginationPipe } from 'src/common/pipes/parse-params-pagination.pipe';

import { CategoryService } from './category.service';

import { CreateCategoryDto } from './dto/create-category.dto';

import type { GetCategoriesPaginationDto } from './dto/get-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Controller('categories')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  /**
   * Lấy danh sách category:
   * - phân trang
   * - tìm kiếm
   */
  @Get()
  @UsePipes(ParseParamsPaginationPipe)
  getCategories(
    @Query()
    query: GetCategoriesPaginationDto,
  ) {
    return this.categoryService.getCategories(query);
  }

  /**
   * Tạo category mới.
   */
  @Post()
  @Roles(UserRole.admin)
  createCategory(
    @Body()
    createCategoryDto: CreateCategoryDto,
  ) {
    return this.categoryService.createCategory(createCategoryDto);
  }
  @Patch(':id')
  @Roles(UserRole.admin)
  updateCategory(
    @Param('id') id: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ) {
    return this.categoryService.updateCategory({
      where: {
        id,
      },
      data: updateCategoryDto,
    });
  }
  @Delete(':id')
  @Roles(UserRole.admin)
  deleteCategory(@Param('id') id: string) {
    return this.categoryService.deleteCategory({ id });
  }
}
