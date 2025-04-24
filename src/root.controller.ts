import { Controller, Get } from '@nestjs/common';

@Controller()
export class RootController {
  @Get()
  root() {
    return { status: 'ok', message: 'Tabanok API' };
  }

  @Get('healthz')
  healthz() {
    return { status: 'ok', message: 'Tabanok API' };
  }
}
