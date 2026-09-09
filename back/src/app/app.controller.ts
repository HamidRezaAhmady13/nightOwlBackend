// import { AppService } from '@/app/app.service';
import { LineLogger } from '@/common/utils/lineLogger';
import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    new LineLogger().log('hello app');

    return this.appService.getHello();
  }

  @Get('health') check() {
    return { status: 'ok' };
  }
}
