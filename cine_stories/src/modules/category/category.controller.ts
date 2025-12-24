import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards, ParseUUIDPipe } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AdminGuard } from '../auth/guards/admin.guard';
import { Category } from '../../infrastructure/database/entities/category.entity';

@Controller('categories')
export class CategoryController {
  constructor(
    @InjectRepository(Category) private readonly categories: Repository<Category>,
  ) {}

  @Get()
  async findAll() {
    const categories = await this.categories.find({
      order: { createdAt: 'DESC' },
    });
    
    // Map to frontend expected format
    return categories.map(cat => ({
      id: cat.id,
      name: cat.name,
      slug: cat.name.toLowerCase().replace(/\s+/g, '-'),
      description: '',
      visible: true,
      sortOrder: 0,
    }));
  }

  @UseGuards(AdminGuard)
  @Post()
  async create(@Body() body: { name: string; slug?: string; description?: string; visible?: boolean }) {
    const category = this.categories.create({
      name: body.name,
    });
    return this.categories.save(category);
  }

  @UseGuards(AdminGuard)
  @Patch(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: { name?: string; visible?: boolean },
  ) {
    const category = await this.categories.findOne({ where: { id } });
    if (!category) throw new Error('Category not found');
    
    if (body.name) category.name = body.name;
    return this.categories.save(category);
  }

  @UseGuards(AdminGuard)
  @Delete(':id')
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    await this.categories.delete(id);
    return { success: true };
  }
}

