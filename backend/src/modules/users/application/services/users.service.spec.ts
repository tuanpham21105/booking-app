import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { PasswordHasher } from '@nestjs/authentication';
import { UsersService } from './users.service';
import { UserRepository } from '../../domain/repositories/user.repository.port';
import { User } from '../../domain/entities/user.entity';
import { UserRole } from '../../domain/enums/user-role.enum';
import { CreateUserDto, ResetPasswordDto, UpdateUserDto } from '../dto';

class MockUserRepository extends UserRepository {
  users: Map<number, User> = new Map();
  nextId = 1;

  lastFindAllPage?: number;
  lastFindAllLimit?: number;
  lastFindAllSearch?: string;
  lastFindAllRole?: UserRole;

  async findById(id: number): Promise<User | null> {
    const user = this.users.get(id);
    if (!user) return null;
    return new User(
      user.fullName,
      user.email,
      user.passwordHash,
      user.role,
      user.id,
      user.createdAt,
      user.updatedAt,
    );
  }

  async findByEmail(email: string): Promise<User | null> {
    for (const user of this.users.values()) {
      if (user.email === email) {
        return new User(
          user.fullName,
          user.email,
          user.passwordHash,
          user.role,
          user.id,
          user.createdAt,
          user.updatedAt,
        );
      }
    }
    return null;
  }

  async findAll(
    page: number = 1,
    limit: number = 10,
    search?: string,
    role?: UserRole,
  ): Promise<[User[], number]> {
    this.lastFindAllPage = page;
    this.lastFindAllLimit = limit;
    this.lastFindAllSearch = search;
    this.lastFindAllRole = role;

    let all = Array.from(this.users.values()).map(
      (u) => new User(u.fullName, u.email, u.passwordHash, u.role, u.id, u.createdAt, u.updatedAt),
    );

    if (search?.trim()) {
      const lower = search.trim().toLowerCase();
      all = all.filter(
        (u) =>
          u.fullName.toLowerCase().includes(lower) ||
          u.email.toLowerCase().includes(lower),
      );
    }

    if (role) {
      all = all.filter((u) => u.role === role);
    }

    const start = (page - 1) * limit;
    const paginated = all.slice(start, start + limit);
    return [paginated, all.length];
  }

  async create(
    fullName: string,
    email: string,
    passwordHash: string,
    role: UserRole = UserRole.CUSTOMER,
  ): Promise<User> {
    const id = this.nextId++;
    const user = new User(fullName, email, passwordHash, role, id, new Date(), new Date());
    this.users.set(id, user);
    return user;
  }

  async update(
    id: number,
    fullName?: string,
    passwordHash?: string,
    role?: UserRole,
  ): Promise<User | null> {
    const user = this.users.get(id);
    if (!user) return null;
    if (fullName !== undefined) user.fullName = fullName;
    if (passwordHash !== undefined) user.passwordHash = passwordHash;
    if (role !== undefined) user.role = role;
    user.updatedAt = new Date();
    return user;
  }

  async delete(id: number): Promise<boolean> {
    return this.users.delete(id);
  }

  async save(user: User): Promise<User> {
    if (!user.id) {
      user.id = this.nextId++;
    }
    user.updatedAt = new Date();
    this.users.set(user.id, user);
    return user;
  }
}

class MockPasswordHasher {
  lastPasswordHashed?: string;
  hashedResult = 'mocked_scrypt_hash_123';

  async hash(password: string): Promise<string> {
    this.lastPasswordHashed = password;
    return this.hashedResult;
  }

  async verify(): Promise<boolean> {
    return true;
  }
}

describe('UsersService', () => {
  let service: UsersService;
  let mockUserRepository: MockUserRepository;
  let mockPasswordHasher: MockPasswordHasher;

  beforeEach(async () => {
    mockUserRepository = new MockUserRepository();
    mockPasswordHasher = new MockPasswordHasher();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: UserRepository,
          useValue: mockUserRepository,
        },
        {
          provide: PasswordHasher,
          useValue: mockPasswordHasher,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const validDto: CreateUserDto = {
      fullName: 'Nguyễn Văn A',
      email: 'nguyenvana@example.com',
      password: 'SecurePassword123!',
      role: UserRole.CUSTOMER,
    };

    it('should create a user successfully with hashed password and role CUSTOMER', async () => {
      const result = await service.create(validDto);

      expect(mockPasswordHasher.lastPasswordHashed).toBe(validDto.password);
      expect(result.fullName).toBe(validDto.fullName);
      expect(result.email).toBe(validDto.email);
      expect(result.passwordHash).toBe(mockPasswordHasher.hashedResult);
      expect(result.role).toBe(UserRole.CUSTOMER);
      expect(result.id).toBe(1);
    });

    it('should create a staff user successfully when role is STAFF', async () => {
      const staffDto: CreateUserDto = {
        fullName: 'Trần Thị Staff',
        email: 'staff@example.com',
        password: 'Password123!',
        role: UserRole.STAFF,
      };

      const result = await service.create(staffDto);

      expect(result.role).toBe(UserRole.STAFF);
      expect(result.fullName).toBe(staffDto.fullName);
    });

    it('should default role to CUSTOMER when role is not provided', async () => {
      const dtoWithoutRole: CreateUserDto = {
        fullName: 'Nguyễn Văn B',
        email: 'nguyenvanb@example.com',
        password: 'Password123!',
      };

      const result = await service.create(dtoWithoutRole);

      expect(result.role).toBe(UserRole.CUSTOMER);
    });

    it('should throw BadRequestException when attempting to create an ADMIN role (BR-01)', async () => {
      const adminDto: CreateUserDto = {
        fullName: 'Fake Admin',
        email: 'fakeadmin@example.com',
        password: 'Password123!',
        role: UserRole.ADMIN,
      };

      await expect(service.create(adminDto)).rejects.toThrow(BadRequestException);
      await expect(service.create(adminDto)).rejects.toThrow(
        'Không được phép tạo tài khoản với vai trò Admin',
      );
      expect(mockPasswordHasher.lastPasswordHashed).toBeUndefined();
    });

    it('should create an ADMIN user successfully when allowAdmin is true (system seed)', async () => {
      const adminDto: CreateUserDto = {
        fullName: 'System Admin',
        email: 'admin@bookingapp.com',
        password: 'AdminPassword123@',
        role: UserRole.ADMIN,
      };

      const result = await service.create(adminDto, true);

      expect(mockPasswordHasher.lastPasswordHashed).toBe(adminDto.password);
      expect(result.role).toBe(UserRole.ADMIN);
      expect(result.fullName).toBe(adminDto.fullName);
      expect(result.email).toBe(adminDto.email);
    });

    it('should throw ConflictException when email already exists', async () => {
      await mockUserRepository.create(
        'Existing User',
        validDto.email,
        'hash_existing',
        UserRole.CUSTOMER,
      );

      await expect(service.create(validDto)).rejects.toThrow(ConflictException);
      await expect(service.create(validDto)).rejects.toThrow(
        'Email đã tồn tại trong hệ thống',
      );
    });
  });

  describe('findAll', () => {
    it('should return paginated list of users with default pagination', async () => {
      await mockUserRepository.create('User 1', 'u1@example.com', 'h1', UserRole.CUSTOMER);
      await mockUserRepository.create('User 2', 'u2@example.com', 'h2', UserRole.STAFF);

      const [users, total] = await service.findAll();

      expect(mockUserRepository.lastFindAllPage).toBe(1);
      expect(mockUserRepository.lastFindAllLimit).toBe(10);
      expect(mockUserRepository.lastFindAllSearch).toBeUndefined();
      expect(mockUserRepository.lastFindAllRole).toBeUndefined();
      expect(total).toBe(2);
      expect(users.length).toBe(2);
      expect(users[0]?.fullName).toBe('User 1');
      expect(users[1]?.fullName).toBe('User 2');
    });

    it('should pass custom page and limit to repository', async () => {
      for (let i = 1; i <= 5; i++) {
        await mockUserRepository.create(`User ${i}`, `u${i}@example.com`, 'h', UserRole.CUSTOMER);
      }

      const [users, total] = await service.findAll(2, 2);

      expect(mockUserRepository.lastFindAllPage).toBe(2);
      expect(mockUserRepository.lastFindAllLimit).toBe(2);
      expect(total).toBe(5);
      expect(users.length).toBe(2);
      expect(users[0]?.fullName).toBe('User 3');
      expect(users[1]?.fullName).toBe('User 4');
    });

    it('should filter users by search keyword matching fullName', async () => {
      await mockUserRepository.create('Nguyễn Văn An', 'an@example.com', 'h', UserRole.CUSTOMER);
      await mockUserRepository.create('Trần Thị Bình', 'binh@example.com', 'h', UserRole.CUSTOMER);
      await mockUserRepository.create('Lê Văn Cường', 'cuong@example.com', 'h', UserRole.STAFF);

      const [users, total] = await service.findAll(1, 10, 'Văn');

      expect(mockUserRepository.lastFindAllSearch).toBe('Văn');
      expect(total).toBe(2);
      expect(users.length).toBe(2);
      expect(users.map((u) => u.fullName)).toEqual(['Nguyễn Văn An', 'Lê Văn Cường']);
    });

    it('should filter users by search keyword matching email', async () => {
      await mockUserRepository.create('Nguyễn Văn An', 'an_vip@booking.com', 'h', UserRole.CUSTOMER);
      await mockUserRepository.create('Trần Thị Bình', 'binh_normal@gmail.com', 'h', UserRole.CUSTOMER);

      const [users, total] = await service.findAll(1, 10, 'booking.com');

      expect(total).toBe(1);
      expect(users.length).toBe(1);
      expect(users[0]?.email).toBe('an_vip@booking.com');
    });

    it('should filter users by role', async () => {
      await mockUserRepository.create('Customer 1', 'c1@example.com', 'h', UserRole.CUSTOMER);
      await mockUserRepository.create('Staff 1', 's1@example.com', 'h', UserRole.STAFF);
      await mockUserRepository.create('Staff 2', 's2@example.com', 'h', UserRole.STAFF);

      const [users, total] = await service.findAll(1, 10, undefined, UserRole.STAFF);

      expect(mockUserRepository.lastFindAllRole).toBe(UserRole.STAFF);
      expect(total).toBe(2);
      expect(users.length).toBe(2);
      expect(users.every((u) => u.role === UserRole.STAFF)).toBe(true);
    });

    it('should filter users by both search keyword and role simultaneously', async () => {
      await mockUserRepository.create('Nguyễn Văn Staff', 'staff1@company.com', 'h', UserRole.STAFF);
      await mockUserRepository.create('Nguyễn Văn Customer', 'cust1@company.com', 'h', UserRole.CUSTOMER);
      await mockUserRepository.create('Trần Thị Staff', 'staff2@company.com', 'h', UserRole.STAFF);

      const [users, total] = await service.findAll(1, 10, 'Nguyễn', UserRole.STAFF);

      expect(total).toBe(1);
      expect(users.length).toBe(1);
      expect(users[0]?.fullName).toBe('Nguyễn Văn Staff');
      expect(users[0]?.role).toBe(UserRole.STAFF);
    });

    it('should return empty list when no users match search criteria', async () => {
      await mockUserRepository.create('User 1', 'u1@example.com', 'h', UserRole.CUSTOMER);

      const [users, total] = await service.findAll(1, 10, 'NonexistentKeyword');

      expect(total).toBe(0);
      expect(users).toEqual([]);
    });
  });

  describe('findById', () => {
    it('should return the user when found', async () => {
      const created = await mockUserRepository.create('User 1', 'u1@example.com', 'h1', UserRole.CUSTOMER);

      const result = await service.findById(created.id!);

      expect(result.id).toBe(created.id);
      expect(result.fullName).toBe('User 1');
    });

    it('should throw NotFoundException when user does not exist', async () => {
      await expect(service.findById(999)).rejects.toThrow(NotFoundException);
      await expect(service.findById(999)).rejects.toThrow(
        'Không tìm thấy người dùng với ID 999',
      );
    });
  });

  describe('findByEmail', () => {
    it('should return user when found by email', async () => {
      await mockUserRepository.create('User 1', 'u1@example.com', 'h1', UserRole.CUSTOMER);

      const result = await service.findByEmail('u1@example.com');

      expect(result).not.toBeNull();
      expect(result?.email).toBe('u1@example.com');
    });

    it('should return null when not found by email', async () => {
      const result = await service.findByEmail('notfound@example.com');

      expect(result).toBeNull();
    });
  });

  describe('update', () => {
    it('should update user fullName and role successfully', async () => {
      const user = await mockUserRepository.create(
        'Original Name',
        'u1@example.com',
        'h1',
        UserRole.CUSTOMER,
      );

      const dto: UpdateUserDto = {
        fullName: 'Updated Name',
        role: UserRole.STAFF,
      };

      const result = await service.update(user.id!, dto);

      expect(result.fullName).toBe('Updated Name');
      expect(result.role).toBe(UserRole.STAFF);
    });

    it('should update user email successfully when new email is not taken', async () => {
      const user = await mockUserRepository.create(
        'User',
        'old@example.com',
        'h1',
        UserRole.CUSTOMER,
      );

      const dto: UpdateUserDto = {
        email: 'new@example.com',
      };

      const result = await service.update(user.id!, dto);

      expect(result.email).toBe('new@example.com');
    });

    it('should allow updating other fields when email is same as current email', async () => {
      const user = await mockUserRepository.create(
        'User',
        'same@example.com',
        'h1',
        UserRole.CUSTOMER,
      );

      const dto: UpdateUserDto = {
        fullName: 'New Name',
        email: 'same@example.com',
      };

      const result = await service.update(user.id!, dto);

      expect(result.fullName).toBe('New Name');
      expect(result.email).toBe('same@example.com');
    });

    it('should throw ConflictException when new email is taken by another user', async () => {
      const user1 = await mockUserRepository.create('User 1', 'user1@example.com', 'h1', UserRole.CUSTOMER);
      await mockUserRepository.create('User 2', 'user2@example.com', 'h2', UserRole.CUSTOMER);

      const dto: UpdateUserDto = {
        email: 'user2@example.com',
      };

      await expect(service.update(user1.id!, dto)).rejects.toThrow(ConflictException);
      await expect(service.update(user1.id!, dto)).rejects.toThrow(
        'Email mới đã tồn tại trong hệ thống',
      );
    });

    it('should throw BadRequestException when attempting to elevate role to ADMIN (BR-01)', async () => {
      const user = await mockUserRepository.create('User 1', 'user1@example.com', 'h1', UserRole.STAFF);

      const dto: UpdateUserDto = {
        role: UserRole.ADMIN,
      };

      await expect(service.update(user.id!, dto)).rejects.toThrow(BadRequestException);
      await expect(service.update(user.id!, dto)).rejects.toThrow(
        'Không được phép nâng quyền tài khoản lên Admin',
      );
    });

    it('should throw BadRequestException when attempting to modify an ADMIN account (BR-01)', async () => {
      const adminUser = await mockUserRepository.create('Admin Master', 'admin@example.com', 'h1', UserRole.ADMIN);

      const dto: UpdateUserDto = {
        fullName: 'Modified Admin',
      };

      await expect(service.update(adminUser.id!, dto)).rejects.toThrow(BadRequestException);
      await expect(service.update(adminUser.id!, dto)).rejects.toThrow(
        'Không được phép chỉnh sửa tài khoản Admin',
      );
    });

    it('should throw NotFoundException when user to update does not exist', async () => {
      await expect(service.update(999, { fullName: 'New Name' })).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('resetPassword', () => {
    it('should reset password with hashed password for Customer or Staff', async () => {
      const user = await mockUserRepository.create(
        'Staff User',
        'staff@example.com',
        'old_hash',
        UserRole.STAFF,
      );

      const dto: ResetPasswordDto = {
        newPassword: 'BrandNewSecurePassword123!',
      };

      const result = await service.resetPassword(user.id!, dto);

      expect(mockPasswordHasher.lastPasswordHashed).toBe(dto.newPassword);
      expect(result.passwordHash).toBe(mockPasswordHasher.hashedResult);
    });

    it('should throw BadRequestException when attempting to reset password for ADMIN (BR-01)', async () => {
      const admin = await mockUserRepository.create(
        'Admin Master',
        'admin@example.com',
        'admin_hash',
        UserRole.ADMIN,
      );

      const dto: ResetPasswordDto = {
        newPassword: 'BrandNewPassword123!',
      };

      await expect(service.resetPassword(admin.id!, dto)).rejects.toThrow(BadRequestException);
      await expect(service.resetPassword(admin.id!, dto)).rejects.toThrow(
        'Không được phép đặt lại mật khẩu cho tài khoản Admin',
      );
    });

    it('should throw NotFoundException when user does not exist', async () => {
      await expect(
        service.resetPassword(999, { newPassword: 'NewPassword!' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('delete', () => {
    it('should delete Customer or Staff user successfully', async () => {
      const user = await mockUserRepository.create(
        'Customer User',
        'customer@example.com',
        'hash',
        UserRole.CUSTOMER,
      );

      const result = await service.delete(user.id!);

      expect(result).toBe(true);
      expect(await mockUserRepository.findById(user.id!)).toBeNull();
    });

    it('should throw BadRequestException when attempting to delete ADMIN user (BR-01)', async () => {
      const admin = await mockUserRepository.create(
        'Admin Master',
        'admin@example.com',
        'hash',
        UserRole.ADMIN,
      );

      await expect(service.delete(admin.id!)).rejects.toThrow(BadRequestException);
      await expect(service.delete(admin.id!)).rejects.toThrow(
        'Không được phép xóa tài khoản Admin',
      );
    });

    it('should throw NotFoundException when user to delete does not exist', async () => {
      await expect(service.delete(999)).rejects.toThrow(NotFoundException);
    });
  });
});
