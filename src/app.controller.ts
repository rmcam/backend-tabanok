import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('App')
@Controller('api/v1')
export class AppController {
    @Get()
    getHello(): string {
        return 'Hello World!';
    }
} 