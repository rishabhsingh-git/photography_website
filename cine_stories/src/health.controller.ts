import { Controller, Get } from '@nestjs/common';

@Controller()
export class HealthController {
  // GET /api
  @Get()
  getRoot() {
    return { message: 'Hello Nest API' };
  }

  // GET /api/health
  @Get('health')
  getHealth() {
    return { status: 'ok' };
  }
}
