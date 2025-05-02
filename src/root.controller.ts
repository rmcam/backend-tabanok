import { Controller, Get } from '@nestjs/common';
import { Public } from './auth/decorators/public.decorator';

@Controller()
export class RootController {
  @Public()
  @Get()
  root() {
    return { status: 'ok', message: 'Tabanok API' };
  }

  @Public()
  @Get('healthz')
  healthz() {
    return { status: 'ok', message: 'Tabanok API' };
  }
}
