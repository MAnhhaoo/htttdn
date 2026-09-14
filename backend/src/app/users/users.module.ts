import { Module } from '@nestjs/common';

import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  controllers: [UsersController],
  providers: [UsersService],

  // Chia sẻ UsersService cho module khác.
  exports: [UsersService],
})
export class UserModule {}
