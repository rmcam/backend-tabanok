import { Controller, Get } from '@nestjs/common';

@Controller()
export class RootController {
  @Get('healthz')
  health() {
    return { status: 'ok', message: 'Tabanok API' };
  }

  @Get()
  getHello(): string {
    return 'Tabanok API is running!';
  }
}
