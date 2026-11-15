import { Global, Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { AccountDirectoryService } from './account-directory.service';

@Global()
@Module({
  imports: [PrismaModule],
  providers: [AccountDirectoryService],
  exports: [AccountDirectoryService],
})
export class AccountDirectoryModule {}

