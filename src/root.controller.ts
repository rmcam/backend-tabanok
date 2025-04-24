import { Controller, Get } from '@nestjs/common';

@Controller()
export class RootController {
  @Get('healthz')
  healthz() {
    return { status: 'ok', message: 'Tabanok API' };
  }
}
