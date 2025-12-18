import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

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
    });
    return this.services.save(service);
  }

  async findAll(activeOnly = false): Promise<Service[]> {
    const qb = this.services.createQueryBuilder('service');
    if (activeOnly) {
      qb.where('service.isActive = :isActive', { isActive: true });
    }
    qb.orderBy('service.createdAt', 'DESC');
    return qb.getMany();
  }

  async findOne(id: string): Promise<Service> {
    const service = await this.services.findOne({ where: { id } });
    if (!service) {
      throw new NotFoundException(`Service with ID ${id} not found`);
    }
    return service;
  }

  async update(id: string, dto: UpdateServiceDto): Promise<Service> {
    const service = await this.findOne(id);
    Object.assign(service, dto);
    return this.services.save(service);
  }

  async remove(id: string): Promise<void> {
    const service = await this.findOne(id);
    await this.services.softRemove(service);
  }
}

