import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserRepository } from '../../../domain/repositories/user.repository.port';
import { User } from '../../../domain/entities/user.entity';
import { UserRole } from '../../../domain/enums/user-role.enum';
import { UserOrmEntity } from '../entities/user.orm-entity';
import {
  calculatePagination,
  convertToDomain,
  convertToDomainList,
  convertToOrm,
} from '../../../../../common/utils';

@Injectable()
export class TypeOrmUserRepository extends UserRepository {
  constructor(
    @InjectRepository(UserOrmEntity)
    private readonly userOrmRepository: Repository<UserOrmEntity>,
  ) {
    super();
  }

  async findById(id: number): Promise<User | null> {
    const entity = await this.userOrmRepository.findOne({ where: { id } });
    return convertToDomain(User, entity);
  }

  async findByEmail(email: string): Promise<User | null> {
    const entity = await this.userOrmRepository.findOne({ where: { email } });
    return convertToDomain(User, entity);
  }

  async findAll(page: number = 1, limit: number = 10): Promise<[User[], number]> {
    const { skip, take } = calculatePagination(page, limit);
    const [entities, total] = await this.userOrmRepository.findAndCount({
      skip,
      take,
      order: { createdAt: 'DESC' },
    });

    return [convertToDomainList(User, entities), total];
  }

  async create(
    fullName: string,
    email: string,
    passwordHash: string,
    role: UserRole = UserRole.CUSTOMER,
  ): Promise<User> {
    const entity = this.userOrmRepository.create({
      fullName,
      email,
      passwordHash,
      role,
    });
    const saved = await this.userOrmRepository.save(entity);
    return convertToDomain(User, saved);
  }

  async update(
    id: number,
    fullName?: string,
    passwordHash?: string,
    role?: UserRole,
  ): Promise<User | null> {
    const existing = await this.userOrmRepository.findOne({ where: { id } });
    if (!existing) {
      return null;
    }

    if (fullName !== undefined) existing.fullName = fullName;
    if (passwordHash !== undefined) existing.passwordHash = passwordHash;
    if (role !== undefined) existing.role = role;

    const updated = await this.userOrmRepository.save(existing);
    return convertToDomain(User, updated);
  }

  async delete(id: number): Promise<boolean> {
    const result = await this.userOrmRepository.delete(id);
    return (result.affected ?? 0) > 0;
  }

  async save(user: User): Promise<User> {
    const orm = convertToOrm(UserOrmEntity, user);
    const saved = await this.userOrmRepository.save(orm);
    return convertToDomain(User, saved);
  }
}
