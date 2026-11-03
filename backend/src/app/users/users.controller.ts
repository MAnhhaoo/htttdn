import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { AnyFilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import * as fs from 'fs';
import { Roles } from '../../common/guards/access-control/roles.decorator';
import { User, type UserInfo } from '../../common/decorators/user.decorator';
import { UsersService } from './users.service';
import {
  CreateUserDto,
  GetUsersPaginationDto,
  UpdateUserDto,
  UpdateUserProfileDto,
  UpdateUserStatusDto,
} from './dto/user.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('upload-avatar')
  @Roles('admin', 'client', 'vendor', 'employee')
  @UseInterceptors(
    AnyFilesInterceptor({
      storage: diskStorage({
        destination: (_req, _file, callback) => {
          const uploadDir = './uploads/avatars';
          fs.mkdirSync(uploadDir, { recursive: true });
          callback(null, uploadDir);
        },
        filename: (_req, file, callback) => {
          const fileName =
            `${Date.now()}-${Math.round(Math.random() * 1e9)}` +
            extname(file.originalname);
          callback(null, fileName);
        },
      }),
      fileFilter: (_req, file, callback) => {
        const allowedTypes = [
          'image/jpeg',
          'image/png',
          'image/webp',
          'image/gif',
          'image/jpg',
        ];
        if (!allowedTypes.includes(file.mimetype)) {
          return callback(
            new BadRequestException('Chỉ chấp nhận ảnh JPEG, PNG, WEBP hoặc GIF'),
            false,
          );
        }
        callback(null, true);
      },
      limits: {
        fileSize: 10 * 1024 * 1024,
        files: 1,
      },
    }),
  )
  uploadAvatar(@UploadedFiles() files: Express.Multer.File[]) {
    if (!files || files.length === 0) {
      throw new BadRequestException('Vui lòng chọn một file ảnh');
    }
    const url = `/uploads/avatars/${files[0].filename}`;
    return {
      url,
      urls: [url],
    };
  }

  @Get()
  @Roles('admin')
  getUsers(@Query() query: GetUsersPaginationDto) {
    return this.usersService.getUsers(query);
  }

  @Post()
  @Roles('admin')
  createUser(@Body() data: CreateUserDto) {
    return this.usersService.createUser(data);
  }

  @Get('profile')
  @Roles('admin', 'client', 'vendor', 'employee')
  getProfile(@User() user: UserInfo) {
    return this.usersService.getUser(user.userID);
  }

  @Patch('profile')
  @Roles('admin', 'client', 'vendor', 'employee')
  updateProfile(@User() user: UserInfo, @Body() data: UpdateUserProfileDto) {
    return this.usersService.updateUser(user.userID, data, user);
  }

  @Get(':id')
  @Roles('admin')
  getUser(@Param('id', ParseUUIDPipe) id: string) {
    return this.usersService.getUser(id);
  }

  @Patch(':id')
  @Roles('admin')
  updateUser(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() data: UpdateUserDto,
    @User() user: UserInfo,
  ) {
    return this.usersService.updateUser(id, data, user);
  }

  @Patch(':id/status')
  @Roles('admin')
  updateUserStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: UpdateUserStatusDto,
    @User() user: UserInfo,
  ) {
    return this.usersService.updateUserStatus(id, body.status, user);
  }

  @Delete(':id')
  @Roles('admin')
  deleteUser(
    @Param('id', ParseUUIDPipe) id: string,
    @User() user: UserInfo,
  ) {
    return this.usersService.deleteUser(id, user);
  }
}
