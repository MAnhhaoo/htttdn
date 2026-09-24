import { Controller, Get } from '@nestjs/common';
import { SkipAuth } from './auth/auth.decorator';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('health')
  @SkipAuth()
  getHealth() {
    return this.appService.getHealth();
  }

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}
