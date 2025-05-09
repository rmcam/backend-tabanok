import { Controller, Get } from '@nestjs/common';

@Controller()
export class RootController {
  @Get('healthz')
  health() {
    return { status: 'ok', message: 'Tabanok API' };
  }
}
