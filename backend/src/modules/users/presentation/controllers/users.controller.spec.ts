import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { UsersController } from './users.controller';
import { UsersService } from '../../application/services/users.service';
import { User } from '../../domain/entities/user.entity';
import { UserRole } from '../../domain/enums/user-role.enum';
import {
  CreateUserDto,
  ResetPasswordDto,
  UpdateUserDto,
  UserQueryDto,
} from '../dto';

class MockUsersService {
  users: User[] = [];
  lastFindAllParams?: {
    page?: number;
    limit?: number;
    search?: string;
    role?: UserRole;
  };
  lastFindByIdParam?: number;
  lastCreateDto?: CreateUserDto;
  lastUpdateParam?: { id: number; dto: UpdateUserDto };
  lastResetPasswordParam?: { id: number; dto: ResetPasswordDto };
  lastDeleteParam?: number;

  async findAll(
    page: number = 1,
    limit: number = 10,
    search?: string,
    role?: UserRole,
  ): Promise<[User[], number]> {
    this.lastFindAllParams = { page, limit, search, role };
    return [this.users, this.users.length];
  }

  async findById(id: number): Promise<User> {
    this.lastFindByIdParam = id;
    const found = this.users.find((u) => u.id === id);
    if (!found) {
      throw new NotFoundException(`Không tìm thấy người dùng với ID ${id}`);
    }
    return found;
  }

  async create(dto: CreateUserDto): Promise<User> {
    this.lastCreateDto = dto;
    const user = new User(
      dto.fullName,
      dto.email,
      'mock_hashed_pwd',
      dto.role ?? UserRole.CUSTOMER,
      this.users.length + 1,
      new Date('2026-11-26T00:00:00.000Z'),
      new Date('2026-11-26T00:00:00.000Z'),
    );
    this.users.push(user);
    return user;
  }

  async update(id: number, dto: UpdateUserDto): Promise<User> {
    this.lastUpdateParam = { id, dto };
    const user = await this.findById(id);
    if (dto.fullName !== undefined) user.fullName = dto.fullName;
    if (dto.email !== undefined) user.email = dto.email;
    if (dto.role !== undefined) user.role = dto.role;
    user.updatedAt = new Date('2026-11-26T12:00:00.000Z');
    return user;
  }

  async resetPassword(id: number, dto: ResetPasswordDto): Promise<User> {
    this.lastResetPasswordParam = { id, dto };
    const user = await this.findById(id);
    user.passwordHash = 'new_hashed_pwd';
    user.updatedAt = new Date('2026-11-26T12:00:00.000Z');
    return user;
  }

  async delete(id: number): Promise<boolean> {
    this.lastDeleteParam = id;
    await this.findById(id);
    this.users = this.users.filter((u) => u.id !== id);
    return true;
  }
}

describe('UsersController', () => {
  let controller: UsersController;
  let mockUsersService: MockUsersService;

  beforeEach(async () => {
    mockUsersService = new MockUsersService();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return paginated user list with metadata and default query', async () => {
      const user1 = new User(
        'User 1',
        'u1@example.com',
        'hash1',
        UserRole.CUSTOMER,
        1,
        new Date('2026-11-01'),
        new Date('2026-11-01'),
      );
      const user2 = new User(
        'User 2',
        'u2@example.com',
        'hash2',
        UserRole.STAFF,
        2,
        new Date('2026-11-02'),
        new Date('2026-11-02'),
      );
      mockUsersService.users = [user1, user2];

      const query: UserQueryDto = {};
      const result = await controller.findAll(query);

      expect(mockUsersService.lastFindAllParams).toEqual({
        page: 1,
        limit: 10,
        search: undefined,
        role: undefined,
      });
      expect(result.data.length).toBe(2);
      expect(result.data[0]).toEqual({
        id: 1,
        fullName: 'User 1',
        email: 'u1@example.com',
        role: UserRole.CUSTOMER,
        createdAt: user1.createdAt,
        updatedAt: user1.updatedAt,
      });
      expect((result.data[0] as unknown as { passwordHash?: string }).passwordHash).toBeUndefined();
      expect(result.meta).toEqual({
        total: 2,
        page: 1,
        limit: 10,
        totalPages: 1,
        hasNextPage: false,
        hasPreviousPage: false,
      });
    });

    it('should forward search and role filters and calculate pagination metadata properly', async () => {
      mockUsersService.users = [
        new User('Staff 1', 's1@example.com', 'h1', UserRole.STAFF, 1),
      ];

      const query: UserQueryDto = {
        page: 2,
        limit: 1,
        search: 'Staff',
        role: UserRole.STAFF,
      };
      const result = await controller.findAll(query);

      expect(mockUsersService.lastFindAllParams).toEqual({
        page: 2,
        limit: 1,
        search: 'Staff',
        role: UserRole.STAFF,
      });
      expect(result.meta.page).toBe(2);
      expect(result.meta.limit).toBe(1);
      expect(result.meta.totalPages).toBe(1);
      expect(result.meta.hasPreviousPage).toBe(true);
      expect(result.meta.hasNextPage).toBe(false);
    });

    it('should fallback limit to 100 when limit exceeds 100 in controller', async () => {
      const query: UserQueryDto = {
        limit: 150,
      };

      const result = await controller.findAll(query);

      expect(mockUsersService.lastFindAllParams?.limit).toBe(100);
      expect(result.meta.limit).toBe(100);
    });

    it('should transform limit exceeding 100 to 100 via plainToInstance in UserQueryDto', () => {
      const dto = plainToInstance(UserQueryDto, { limit: '250', page: '2' });

      expect(dto.limit).toBe(100);
      expect(dto.page).toBe(2);
    });

    it('should retain limit when it is within allowable range in UserQueryDto', () => {
      const dto = plainToInstance(UserQueryDto, { limit: '50' });

      expect(dto.limit).toBe(50);
    });
  });

  describe('findById', () => {
    it('should return user details without passwordHash when user exists', async () => {
      const user = new User(
        'Test User',
        'test@example.com',
        'secret_hash',
        UserRole.CUSTOMER,
        10,
        new Date('2026-11-10'),
        new Date('2026-11-10'),
      );
      mockUsersService.users = [user];

      const result = await controller.findById(10);

      expect(mockUsersService.lastFindByIdParam).toBe(10);
      expect(result).toEqual({
        id: 10,
        fullName: 'Test User',
        email: 'test@example.com',
        role: UserRole.CUSTOMER,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      });
      expect((result as unknown as { passwordHash?: string }).passwordHash).toBeUndefined();
    });

    it('should propagate NotFoundException when user does not exist', async () => {
      await expect(controller.findById(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('should create user and return details response without passwordHash', async () => {
      const dto: CreateUserDto = {
        fullName: 'New Customer',
        email: 'customer@example.com',
        password: 'Password123!',
        role: UserRole.CUSTOMER,
      };

      const result = await controller.create(dto);

      expect(mockUsersService.lastCreateDto).toEqual(dto);
      expect(result.id).toBe(1);
      expect(result.fullName).toBe('New Customer');
      expect(result.email).toBe('customer@example.com');
      expect(result.role).toBe(UserRole.CUSTOMER);
      expect((result as unknown as { passwordHash?: string }).passwordHash).toBeUndefined();
    });
  });

  describe('update', () => {
    it('should update user information and return updated details', async () => {
      const existingUser = new User(
        'Old Name',
        'old@example.com',
        'hash',
        UserRole.CUSTOMER,
        1,
      );
      mockUsersService.users = [existingUser];

      const dto: UpdateUserDto = {
        fullName: 'Updated Name',
        role: UserRole.STAFF,
      };

      const result = await controller.update(1, dto);

      expect(mockUsersService.lastUpdateParam).toEqual({ id: 1, dto });
      expect(result.fullName).toBe('Updated Name');
      expect(result.role).toBe(UserRole.STAFF);
      expect((result as unknown as { passwordHash?: string }).passwordHash).toBeUndefined();
    });
  });

  describe('resetPassword', () => {
    it('should call resetPassword and return success message response', async () => {
      const user = new User('User', 'u@example.com', 'old_hash', UserRole.STAFF, 1);
      mockUsersService.users = [user];

      const dto: ResetPasswordDto = {
        newPassword: 'BrandNewPassword123!',
      };

      const result = await controller.resetPassword(1, dto);

      expect(mockUsersService.lastResetPasswordParam).toEqual({ id: 1, dto });
      expect(result).toEqual({
        success: true,
        message: 'Đặt lại mật khẩu thành công',
      });
    });
  });

  describe('delete', () => {
    it('should delete user and return success message response', async () => {
      const user = new User('User', 'u@example.com', 'hash', UserRole.CUSTOMER, 1);
      mockUsersService.users = [user];

      const result = await controller.delete(1);

      expect(mockUsersService.lastDeleteParam).toBe(1);
      expect(result).toEqual({
        success: true,
        message: 'Xóa tài khoản thành công',
      });
      expect(mockUsersService.users.length).toBe(0);
    });
  });
});
