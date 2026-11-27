import type { Service } from '../../../services/domain/entities/service.entity';

/**
 * Domain Schedule Entity thiết kế bằng TypeScript thuần,
 * độc lập hoàn toàn với framework và thư viện cơ sở dữ liệu.
 */
export class Schedule {
  id?: number;
  serviceId: number;
  date: string;
  startTime: string;
  duration: number;
  totalSlots: number;
  createdAt?: Date;
  updatedAt?: Date;
  service?: Service;

  constructor(
    serviceId: number,
    date: string,
    startTime: string,
    duration: number,
    totalSlots: number,
    id?: number,
    createdAt?: Date,
    updatedAt?: Date,
    service?: Service,
  ) {
    this.serviceId = serviceId;
    this.date = date;
    this.startTime = startTime;
    this.duration = duration;
    this.totalSlots = totalSlots;
    this.id = id;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
    this.service = service;
  }
}
