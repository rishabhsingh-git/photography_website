import {
  Controller,
  Get,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  Body,
  Req,
} from '@nestjs/common';
import type { Express } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

import { MediaService } from './media.service';

@Controller('media')
export class MediaController {
  constructor(private readonly media: MediaService) {}

  @UseGuards(JwtAuthGuard)
  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  upload(
    @Req() req: any,
    @UploadedFile() file: Express.Multer.File,
    @Body() body: { title: string; description?: string; category?: string; tags?: string[] },
  ) {
    return this.media.upload(req.user.userId, file, body);
  }

  @Get()
  list(@Body() body: { cursor?: string; limit?: number }) {
    return this.media.list(body.cursor, body.limit);
  }
}
