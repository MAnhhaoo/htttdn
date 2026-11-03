import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { StringUtilModule } from '../utils/string-util/string-util.module';

@Global()
@Module({
  imports: [StringUtilModule],
  controllers: [],
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
