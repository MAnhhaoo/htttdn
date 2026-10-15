import {
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Query,
} from '@nestjs/common';


import { User } from 'src/common/decorators/user.decorator';
import type { UserInfo } from 'src/common/decorators/user.decorator';
import { Roles } from 'src/common/guards/access-control/roles.decorator';
import { GetNotificationsQueryDto } from './dto/get-notification.dto';
import { NotificationsService } from './notifications.service';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  @Roles('client', 'vendor', 'admin')
  list(@Query() query: GetNotificationsQueryDto, @User() user: UserInfo) {
    return this.notificationsService.list(user, query);
  }

  @Get('unread-count')
  @Roles('client', 'vendor', 'admin')
  unreadCount(@User() user: UserInfo) {
    return this.notificationsService.unreadCount(user);
  }

  @Patch('read-all')
  @Roles('client', 'vendor', 'admin')
  markAllRead(@User() user: UserInfo) {
    return this.notificationsService.markAllRead(user);
  }

  @Patch(':id/read')
  @Roles('client', 'vendor', 'admin')
  markRead(@Param('id', ParseUUIDPipe) id: string, @User() user: UserInfo) {
    return this.notificationsService.markRead(id, user);
  }
}
