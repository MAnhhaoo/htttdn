import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';


import { SkipAuth } from 'src/app/auth/auth.decorator';
import { User } from 'src/common/decorators/user.decorator';
import type { UserInfo } from 'src/common/decorators/user.decorator';
import { Roles } from 'src/common/guards/access-control/roles.decorator';
import { ParseParamsPaginationPipe } from 'src/common/pipes/parse-params-pagination.pipe';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { GetReviewsPaginationDto } from './dto/get-review.dto';
import { ReviewsService } from './reviews.service';

@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Get('product/:productId')
  @SkipAuth()
  list(@Param('productId', ParseUUIDPipe) productId: string) {
    return this.reviewsService.listByProduct(productId);
  }

  @Get('admin/all')
  @Roles('admin')
  listAll(
    @Query(new ParseParamsPaginationPipe()) query: GetReviewsPaginationDto,
  ) {
    return this.reviewsService.listAll(query);
  }

  @Post()
  @Roles('client')
  create(@Body() dto: CreateReviewDto, @User() user: UserInfo) {
    return this.reviewsService.create(user.userID, dto);
  }

  @Delete('admin/:id')
  @Roles('admin')
  moderateRemove(@Param('id', ParseUUIDPipe) id: string) {
    return this.reviewsService.moderateRemove(id);
  }

  @Patch(':id')
  @Roles('client')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateReviewDto,
    @User() user: UserInfo,
  ) {
    return this.reviewsService.update(user.userID, id, dto);
  }

  @Delete(':id')
  @Roles('client')
  remove(@Param('id', ParseUUIDPipe) id: string, @User() user: UserInfo) {
    return this.reviewsService.remove(user.userID, id);
  }
}
