import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';
import { ServiceService, CreateServiceDto, UpdateServiceDto } from './service.service';

@Controller('services')
export class ServiceController {
  constructor(private readonly serviceService: ServiceService) {}

  // Public endpoint - get all active services
  @Get()
  findAll() {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🔥 [ServiceController] GET /api/services - ENDPOINT CALLED!');
    console.log('🔥 [ServiceController] Request received from frontend');
    console.log('🔥 [ServiceController] Timestamp:', new Date().toISOString());
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    try {
      const result = this.serviceService.findAll(true);
      console.log('✅ [ServiceController] Service query initiated, returning promise');
      console.log('✅ [ServiceController] Result will be sent to frontend');
      
      // Add logging when promise resolves
      Promise.resolve(result).then((services) => {
        console.log('✅ [ServiceController] Services query completed');
        console.log(`✅ [ServiceController] Returning ${Array.isArray(services) ? services.length : 0} services to frontend`);
        if (Array.isArray(services) && services.length > 0) {
          console.log('✅ [ServiceController] First service:', {
            id: services[0].id,
            title: services[0].title,
            isActive: services[0].isActive,
          });
        }
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      }).catch((error) => {
        console.error('❌ [ServiceController] Error in service query:', error);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      });
      
      return result;
    } catch (error) {
      console.error('❌ [ServiceController] Exception in findAll:', error);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      throw error;
    }
  }

  // Admin endpoints - MUST be before @Get(':id') to avoid route conflicts
  @UseGuards(AdminGuard)
  @Get('admin/all')
  async findAllAdmin() {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🔒 [ServiceController] GET /api/services/admin/all - Admin endpoint called');
    console.log('🔒 [ServiceController] Request from admin user (auth required)');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    try {
      const services = await this.serviceService.findAll(false);
      console.log(`🔒 [ServiceController] Returning ${services.length} services to admin panel`);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      return services;
    } catch (error) {
      console.error('❌ [ServiceController] Error in findAllAdmin:', error);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      throw error;
    }
  }

  @UseGuards(AdminGuard)
  @Post()
  create(@Body() createServiceDto: CreateServiceDto) {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🔒 [ServiceController] POST /api/services - Creating new service');
    console.log('🔒 [ServiceController] Service data:', JSON.stringify(createServiceDto, null, 2));
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    const result = this.serviceService.create(createServiceDto);
    console.log('🔒 [ServiceController] Service created successfully');
    return result;
  }

  // Public endpoint - get single service (must be after specific routes)
  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.serviceService.findOne(id);
  }

  @UseGuards(AdminGuard)
  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateServiceDto: UpdateServiceDto,
  ) {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`🔒 [ServiceController] PATCH /api/services/${id} - Updating service`);
    console.log('🔒 [ServiceController] Update data:', JSON.stringify(updateServiceDto, null, 2));
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    return this.serviceService.update(id, updateServiceDto);
  }

  @UseGuards(AdminGuard)
  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`🔒 [ServiceController] DELETE /api/services/${id} - Deleting service`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    return this.serviceService.remove(id);
  }
}

