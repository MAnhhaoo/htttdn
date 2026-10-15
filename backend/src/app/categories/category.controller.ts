import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';



import { Roles } from 'src/common/guards/access-control/roles.decorator';

import { CategoryService } from './category.service';

import { CreateCategoryDto } from './dto/create-category.dto';

import { GetCategoriesPaginationDto } from './dto/get-category.dto';

import { UpdateCategoryDto } from './dto/update-category.dto';
import { SkipAuth } from 'src/app/auth/auth.decorator';

@Controller('categories')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  /**
   * Lấy danh sách category:
   * - phân trang
   * - tìm kiếm
   */
  @Get()
  @SkipAuth()
  getCategories(@Query() query: GetCategoriesPaginationDto) {
    return this.categoryService.getCategories(query);
  }

  /**
   * Tạo category mới.
   */
  @Post()
  @Roles('admin')
  createCategory(
    @Body()
    createCategoryDto: CreateCategoryDto,
  ) {
    return this.categoryService.createCategory(createCategoryDto);
  }
  @Patch(':id')
  @Roles('admin')
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
  @Roles('admin')
  deleteCategory(@Param('id') id: string) {
    return this.categoryService.deleteCategory({ id });
  }
}
