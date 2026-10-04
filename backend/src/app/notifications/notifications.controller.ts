import {
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Query,
} from '@nestjs/common';
import { UserRole } from '@prisma/client';

import { User } from 'src/common/decorators/user.decorator';
import type { UserInfo } from 'src/common/decorators/user.decorator';
import { Roles } from 'src/common/guards/access-control/roles.decorator';
import { GetNotificationsQueryDto } from './dto/get-notification.dto';
import { NotificationsService } from './notifications.service';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  @Roles(UserRole.customer, UserRole.vendor, UserRole.admin)
  list(@Query() query: GetNotificationsQueryDto, @User() user: UserInfo) {
    return this.notificationsService.list(user.userID, query);
  }

  @Get('unread-count')
  @Roles(UserRole.customer, UserRole.vendor, UserRole.admin)
  unreadCount(@User() user: UserInfo) {
    return this.notificationsService.unreadCount(user.userID);
  }

  @Patch('read-all')
  @Roles(UserRole.customer, UserRole.vendor, UserRole.admin)
  markAllRead(@User() user: UserInfo) {
    return this.notificationsService.markAllRead(user.userID);
  }

  @Patch(':id/read')
  @Roles(UserRole.customer, UserRole.vendor, UserRole.admin)
  markRead(@Param('id', ParseUUIDPipe) id: string, @User() user: UserInfo) {
    return this.notificationsService.markRead(id, user.userID);
  }
}
