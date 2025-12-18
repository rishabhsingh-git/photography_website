import { Column, Entity, Index, OneToMany } from 'typeorm';

import { BaseEntity } from './base.entity';
import { Photo } from './photo.entity';
import { Notification } from './notification.entity';
import { Payment } from './payment.entity';

export enum AuthProvider {
  LOCAL = 'local',
  GOOGLE = 'google',
  FACEBOOK = 'facebook',
}

export enum UserRole {
  CLIENT = 'client',
  ADMIN = 'admin',
}

@Entity({ name: 'users' })
export class User extends BaseEntity {
  @Index({ unique: true })
  @Column()
  email!: string;

  // Force text column; avoids TypeORM inferring Object (unsupported in Postgres)
  @Column({ type: 'text', nullable: true, select: false })
  passwordHash?: string | null;

  @Column({ type: 'enum', enum: AuthProvider, default: AuthProvider.LOCAL })
  provider!: AuthProvider;

  @Column({
    type: 'enum',
    enum: UserRole,
    array: true,
    default: [UserRole.CLIENT],
    nullable: false,
  })
  roles!: UserRole[];
  

  @Column({ type: 'text', nullable: true })
  name?: string | null;

  @Column({ type: 'text', nullable: true })
  phone?: string | null;

  @Column({ type: 'text', nullable: true })
  address?: string | null;
  
  // Explicit text column; avoids Object inference in Postgres
  @Column({ type: 'text', nullable: true })
  oauthId?: string | null;

  @OneToMany(() => Photo, (photo) => photo.owner)
  photos!: Photo[];

  @OneToMany(() => Notification, (notification) => notification.user)
  notifications!: Notification[];

  @OneToMany(() => Payment, (payment) => payment.user)
  payments!: Payment[];
}
