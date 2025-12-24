import {
  Controller,
  Get,
  Post,
  UploadedFile,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
  Body,
  Req,
  Query,
  Patch,
  Param,
} from '@nestjs/common';
import type { Express } from 'express';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';
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

// Assets endpoint - maps to photos
@Controller('assets')
export class AssetsController {
  constructor(private readonly media: MediaService) {}

  @Get()
  async list(@Query('categoryId') categoryId?: string, @Query('serviceId') serviceId?: string) {
    const result = await this.media.list(undefined, 100, serviceId);
    let photos = result.data || [];
    
    if (categoryId) {
      photos = photos.filter((p: any) => p.category?.id === categoryId);
    }
    
    return photos.map((photo: any) => ({
      id: photo.id,
      url: photo.url,
      title: photo.title,
      tags: photo.tags?.map((t: any) => t.name) || [],
      categoryId: photo.category?.id,
      serviceId: photo.service?.id || photo.serviceId,
      service: photo.service ? {
        id: photo.service.id,
        title: photo.service.title,
        icon: photo.service.icon,
      } : null,
    }));
  }

  @UseGuards(AdminGuard)
  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async upload(
    @Req() req: any,
    @UploadedFile() file: Express.Multer.File,
    @Body() body: { title?: string; categoryId?: string; serviceId?: string },
  ) {
    try {
      console.log('📥 [AssetsController] Single upload request:', {
        fileName: file?.originalname,
        fileSize: file?.size,
        serviceId: body.serviceId,
        categoryId: body.categoryId,
        userId: req.user.userId,
      });

      if (!file) {
        throw new Error('No file provided');
      }

      const result = await this.media.upload(
        req.user.userId,
        file,
        {
          title: body.title || file.originalname,
          categoryId: body.categoryId,
          serviceId: body.serviceId,
        },
      );
      
      console.log('✅ [AssetsController] Single upload successful:', {
        id: result.id,
        url: result.url,
        serviceId: result.serviceId,
      });
      
      return {
        id: result.id,
        url: result.url,
        title: result.title,
        tags: result.tags?.map((t: any) => t.name) || [],
        categoryId: result.category?.id,
        serviceId: result.service?.id || result.serviceId,
        service: result.service ? {
          id: result.service.id,
          title: result.service.title,
          icon: result.service.icon,
        } : null,
      };
    } catch (error: any) {
      console.error('❌ [AssetsController] Single upload failed:', {
        error: error.message,
        stack: error.stack,
        serviceId: body.serviceId,
      });
      throw error;
    }
  }

  @UseGuards(AdminGuard)
  @Post('upload-multiple')
  @UseInterceptors(FilesInterceptor('files', 20))
  async uploadMultiple(
    @Req() req: any,
    @UploadedFiles() files: Express.Multer.File[],
    @Body() body: { categoryId?: string; serviceId?: string },
  ) {
    try {
      console.log('📥 [AssetsController] Multiple upload request:', {
        fileCount: files?.length || 0,
        serviceId: body.serviceId,
        categoryId: body.categoryId,
        userId: req.user.userId,
      });

      if (!files || files.length === 0) {
        throw new Error('No files provided');
      }

      const results = await Promise.all(
        files.map((file, index) => {
          console.log(`📤 [AssetsController] Uploading file ${index + 1}/${files.length}:`, file.originalname);
          return this.media.upload(req.user.userId, file, {
            title: file.originalname,
            categoryId: body.categoryId,
            serviceId: body.serviceId,
          });
        })
      );
      
      console.log('✅ [AssetsController] Multiple upload successful:', {
        count: results.length,
        serviceId: body.serviceId,
        urls: results.map(r => r.url),
      });
      
      return results.map((result) => ({
        id: result.id,
        url: result.url,
        title: result.title,
        tags: result.tags?.map((t: any) => t.name) || [],
        categoryId: result.category?.id,
        serviceId: result.service?.id || result.serviceId,
        service: result.service ? {
          id: result.service.id,
          title: result.service.title,
          icon: result.service.icon,
        } : null,
      }));
    } catch (error: any) {
      console.error('❌ [AssetsController] Multiple upload failed:', {
        error: error.message,
        stack: error.stack,
        serviceId: body.serviceId,
        fileCount: files?.length || 0,
      });
      throw error;
    }
  }

  @UseGuards(AdminGuard)
  @Patch(':id')
  async update(@Param('id') id: string, @Body() body: Partial<any>) {
    // Update logic would go here
    return { success: true };
  }
}
