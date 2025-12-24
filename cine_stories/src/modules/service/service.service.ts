import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';

import { Service } from '../../infrastructure/database/entities/service.entity';

export interface CreateServiceDto {
  title: string;
  slogan?: string;
  description?: string;
  highlights?: string[];
  price: number;
  discountedPrice?: number;
  isActive?: boolean;
  metadata?: Record<string, unknown>;
  imageUrl?: string;
  icon?: string;
}

export interface UpdateServiceDto extends Partial<CreateServiceDto> {}

@Injectable()
export class ServiceService {
  constructor(
    @InjectRepository(Service) private readonly services: Repository<Service>,
  ) {}

  async create(dto: CreateServiceDto): Promise<Service> {
    console.log('🔨 [ServiceService] Creating service:', {
      title: dto.title,
      price: dto.price,
      isActive: dto.isActive ?? true,
    });
    
    const service = this.services.create({
      title: dto.title,
      slogan: dto.slogan,
      description: dto.description,
      highlights: dto.highlights || [],
      price: dto.price,
      discountedPrice: dto.discountedPrice,
      isActive: dto.isActive ?? true,
      metadata: dto.metadata || {},
      imageUrl: dto.imageUrl,
      icon: dto.icon,
      deletedAt: null, // Explicitly set to null to avoid soft-delete issues
    });
    
    // Save directly without transaction - TypeORM handles commits automatically
    // Using transaction was causing visibility issues
    const saved = await this.services.save(service);
    
    console.log('✅ [ServiceService] Service saved:', {
      id: saved.id,
      title: saved.title,
      isActive: saved.isActive,
      deletedAt: saved.deletedAt,
    });
    
    // Verify it was saved (using a new query to ensure it's committed)
    await new Promise(resolve => setTimeout(resolve, 100)); // Small delay for commit
    
    const verify = await this.services.findOne({ 
      where: { 
        id: saved.id,
        deletedAt: IsNull(),
      } 
    });
    
    if (!verify) {
      console.error('❌ [ServiceService] Service not found after save!');
      throw new Error('Service was not persisted to database');
    }
    
    console.log('✅ [ServiceService] Service verified in database:', {
      id: verify.id,
      title: verify.title,
    });
    
    return saved;
  }

  async findAll(activeOnly = false): Promise<Service[]> {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`🔍 [ServiceService] findAll called (activeOnly: ${activeOnly})`);
    
    // First, check with direct SQL query to see what's actually in the database
    const directQuery = await this.services.query(
      'SELECT id, title, "isActive", "deletedAt" FROM services ORDER BY "createdAt" DESC LIMIT 10'
    );
    console.log(`🔍 [ServiceService] Direct SQL query found ${directQuery.length} services in database`);
    if (directQuery.length > 0) {
      directQuery.forEach((s: any, idx: number) => {
        console.log(`  ${idx + 1}. "${s.title}" - Active: ${s.isActive}, Deleted: ${s.deletedAt ? 'YES' : 'NO'}, ID: ${s.id}`);
      });
    }
    
    // Use simple find with IsNull() for better reliability
    const whereClause: any = { deletedAt: IsNull() };
    if (activeOnly) {
      whereClause.isActive = true;
    }
    
    // Get counts for debugging
    const totalCount = await this.services.count({ where: { deletedAt: IsNull() } });
    const activeCount = await this.services.count({ 
      where: { 
        deletedAt: IsNull(),
        isActive: true 
      } 
    });
    const inactiveCount = await this.services.count({ 
      where: { 
        deletedAt: IsNull(),
        isActive: false 
      } 
    });
    
    console.log(`📊 [ServiceService] TypeORM count: Total=${totalCount}, Active=${activeCount}, Inactive=${inactiveCount}`);
    
    // Use find() instead of query builder for simplicity and reliability
    const results = await this.services.find({
      where: whereClause,
      order: { createdAt: 'DESC' },
    });
    
    console.log(`📦 [ServiceService] TypeORM find() returned ${results.length} services (activeOnly: ${activeOnly})`);
    
    // Log service details for debugging
    if (results.length > 0) {
      console.log('📋 [ServiceService] Services found by TypeORM:');
      results.forEach((s, idx) => {
        console.log(`  ${idx + 1}. "${s.title}" - Active: ${s.isActive}, Price: ₹${s.price}, ID: ${s.id}`);
      });
    } else {
      console.log('⚠️  [ServiceService] TypeORM find() returned NO services!');
      if (totalCount > 0 && activeOnly) {
        console.log(`   → ${totalCount} services exist but ${inactiveCount} are inactive`);
      } else if (totalCount === 0) {
        console.log('   → Database is empty - create services via admin panel!');
      } else {
        console.log('   → TypeORM query issue - direct SQL found services but TypeORM did not!');
      }
    }
    
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    return results;
  }

  async findOne(id: string): Promise<Service> {
    const service = await this.services.findOne({ 
      where: { 
        id,
        deletedAt: IsNull(), // Exclude soft-deleted
      } 
    });
    if (!service) {
      throw new NotFoundException(`Service with ID ${id} not found`);
    }
    return service;
  }

  async update(id: string, dto: UpdateServiceDto): Promise<Service> {
    const service = await this.findOne(id);
    Object.assign(service, dto);
    
    // Use transaction to ensure immediate commit
    const updated = await this.services.manager.transaction(
      'READ COMMITTED',
      async (transactionalEntityManager) => {
        const result = await transactionalEntityManager.save(Service, service);
        
        // Force flush
        await transactionalEntityManager.query('SELECT 1');
        
        // Verify update
        const verify = await transactionalEntityManager
          .createQueryBuilder(Service, 'service')
          .where('service.id = :id', { id: result.id })
          .andWhere('service.deletedAt IS NULL')
          .getOne();
        
        if (!verify) {
          throw new Error('❌ Service update was not persisted!');
        }
        
        return result;
      }
    );
    
    // Wait for commit
    await new Promise(resolve => setTimeout(resolve, 50));
    
    console.log('✅ [ServiceService] Service updated:', {
      id: updated.id,
      title: updated.title,
      isActive: updated.isActive,
    });
    
    return updated;
  }

  async remove(id: string): Promise<void> {
    const service = await this.findOne(id);
    await this.services.softRemove(service);
  }
}

