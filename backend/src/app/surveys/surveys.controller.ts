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
import { UserRole } from '@prisma/client';

import { User } from 'src/common/decorators/user.decorator';
import type { UserInfo } from 'src/common/decorators/user.decorator';
import { Roles } from 'src/common/guards/access-control/roles.decorator';
import { CreateSurveyDto } from './dto/create-survey.dto';
import {
  GetSurveyResultsQueryDto,
  GetSurveysQueryDto,
} from './dto/get-survey.dto';
import { SubmitSurveyDto } from './dto/submit-survey.dto';
import { GetSurveyInboxQueryDto } from './dto/survey-campaign.dto';
import { SurveyStatusDto } from './dto/survey-status.dto';
import { UpdateSurveyDto } from './dto/update-survey.dto';
import { SurveysService } from './surveys.service';

@Controller('surveys')
export class SurveysController {
  constructor(private readonly surveysService: SurveysService) {}

  @Post()
  @Roles(UserRole.admin, UserRole.vendor)
  create(@Body() dto: CreateSurveyDto, @User() user: UserInfo) {
    return this.surveysService.create(dto, user);
  }

  @Get('mine')
  @Roles(UserRole.admin, UserRole.vendor)
  listMine(@Query() query: GetSurveysQueryDto, @User() user: UserInfo) {
    return this.surveysService.listMine(user.userID, query);
  }

  @Get('admin/all')
  @Roles(UserRole.admin)
  listAll(@Query() query: GetSurveysQueryDto) {
    return this.surveysService.listAll(query);
  }

  @Get('inbox')
  @Roles(UserRole.customer, UserRole.vendor)
  listInbox(@Query() query: GetSurveyInboxQueryDto, @User() user: UserInfo) {
    return this.surveysService.listInbox(user.userID, query);
  }

  @Get('inbox/:responseId')
  @Roles(UserRole.customer, UserRole.vendor)
  getInboxDetail(
    @Param('responseId', ParseUUIDPipe) responseId: string,
    @User() user: UserInfo,
  ) {
    return this.surveysService.getInboxDetail(responseId, user.userID);
  }

  @Patch('inbox/:responseId/open')
  @Roles(UserRole.customer, UserRole.vendor)
  openResponse(
    @Param('responseId', ParseUUIDPipe) responseId: string,
    @User() user: UserInfo,
  ) {
    return this.surveysService.openResponse(responseId, user.userID);
  }

  @Post('inbox/:responseId/responses')
  @Roles(UserRole.customer, UserRole.vendor)
  submitResponse(
    @Param('responseId', ParseUUIDPipe) responseId: string,
    @Body() dto: SubmitSurveyDto,
    @User() user: UserInfo,
  ) {
    return this.surveysService.submitResponse(responseId, user.userID, dto);
  }

  @Patch('inbox/:responseId/skip')
  @Roles(UserRole.customer, UserRole.vendor)
  skipResponse(
    @Param('responseId', ParseUUIDPipe) responseId: string,
    @User() user: UserInfo,
  ) {
    return this.surveysService.skipResponse(responseId, user.userID);
  }

  @Get('orders/:orderId/pending')
  @Roles(UserRole.customer)
  listPendingForOrder(
    @Param('orderId', ParseUUIDPipe) orderId: string,
    @User() user: UserInfo,
  ) {
    return this.surveysService.listPendingForOrder(orderId, user.userID);
  }

  @Get(':id/manage')
  @Roles(UserRole.admin, UserRole.vendor)
  getManagementDetail(
    @Param('id', ParseUUIDPipe) id: string,
    @User() user: UserInfo,
  ) {
    return this.surveysService.getManagementDetail(id, user);
  }

  @Get(':id/results')
  @Roles(UserRole.admin, UserRole.vendor)
  getResults(
    @Param('id', ParseUUIDPipe) id: string,
    @Query() query: GetSurveyResultsQueryDto,
    @User() user: UserInfo,
  ) {
    return this.surveysService.getResults(id, user, query);
  }

  @Get(':id/orders/:orderId/my-response')
  @Roles(UserRole.customer)
  getMyResponse(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('orderId', ParseUUIDPipe) orderId: string,
    @User() user: UserInfo,
  ) {
    return this.surveysService.getMyResponse(id, orderId, user.userID);
  }

  @Post(':id/orders/:orderId/responses')
  @Roles(UserRole.customer)
  submit(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('orderId', ParseUUIDPipe) orderId: string,
    @Body() dto: SubmitSurveyDto,
    @User() user: UserInfo,
  ) {
    return this.surveysService.submit(id, orderId, user.userID, dto);
  }

  @Patch(':id/orders/:orderId/skip')
  @Roles(UserRole.customer)
  skip(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('orderId', ParseUUIDPipe) orderId: string,
    @User() user: UserInfo,
  ) {
    return this.surveysService.skip(id, orderId, user.userID);
  }

  @Patch(':id/status')
  @Roles(UserRole.admin, UserRole.vendor)
  changeStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: SurveyStatusDto,
    @User() user: UserInfo,
  ) {
    return this.surveysService.changeStatus(id, dto.status, user);
  }

  @Patch(':id')
  @Roles(UserRole.admin, UserRole.vendor)
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateSurveyDto,
    @User() user: UserInfo,
  ) {
    return this.surveysService.update(id, dto, user);
  }

  @Delete(':id')
  @Roles(UserRole.admin, UserRole.vendor)
  remove(@Param('id', ParseUUIDPipe) id: string, @User() user: UserInfo) {
    return this.surveysService.remove(id, user);
  }
}
