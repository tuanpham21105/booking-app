import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { AdminSeederService } from './admin-seeder.service';
import { UsersService } from './users.service';
import { UserRole } from '../../domain/enums/user-role.enum';
import { User } from '../../domain/entities/user.entity';
import { CreateUserDto } from '../dto/create-user.dto';

class MockUsersService {
  findByEmailUser: User | null = null;
  findAllAdmins: User[] = [];
  createdUser: User | null = null;
  lastFindByEmailCall?: string;
  lastFindAllRole?: UserRole;
  lastCreateDto?: CreateUserDto;
  lastCreateAllowAdmin?: boolean;

  async findByEmail(email: string): Promise<User | null> {
    this.lastFindByEmailCall = email;
    return this.findByEmailUser;
  }

  async findAll(
    page: number = 1,
    limit: number = 10,
    search?: string,
    role?: UserRole,
  ): Promise<[User[], number]> {
    this.lastFindAllRole = role;
    if (role === UserRole.ADMIN) {
      return [this.findAllAdmins, this.findAllAdmins.length];
    }
    return [[], 0];
  }

  async create(dto: CreateUserDto, allowAdmin: boolean = false): Promise<User> {
    this.lastCreateDto = dto;
    this.lastCreateAllowAdmin = allowAdmin;
    return (
      this.createdUser ??
      new User(
        dto.fullName,
        dto.email,
        'hashed_password',
        dto.role ?? UserRole.CUSTOMER,
        1,
        new Date(),
        new Date(),
      )
    );
  }
}

class MockConfigService {
  values: Record<string, unknown> = {};

  get<T>(key: string): T | undefined {
    return this.values[key] as T | undefined;
  }
}

describe('AdminSeederService', () => {
  let service: AdminSeederService;
  let mockUsersService: MockUsersService;
  let mockConfigService: MockConfigService;

  const mockAdminUser = new User(
    'System Admin',
    'admin@bookingapp.com',
    'hashed_password',
    UserRole.ADMIN,
    1,
    new Date(),
    new Date(),
  );

  beforeEach(async () => {
    mockUsersService = new MockUsersService();
    mockConfigService = new MockConfigService();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminSeederService,
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<AdminSeederService>(AdminSeederService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('seedAdmin', () => {
    it('should seed admin user successfully when neither email nor admin exists', async () => {
      mockConfigService.values['admin'] = {
        name: 'Super Admin',
        email: 'superadmin@bookingapp.com',
        password: 'SuperAdminPassword123@',
      };
      mockUsersService.createdUser = mockAdminUser;

      const result = await service.seedAdmin();

      expect(mockUsersService.lastFindByEmailCall).toBe('superadmin@bookingapp.com');
      expect(mockUsersService.lastFindAllRole).toBe(UserRole.ADMIN);
      expect(mockUsersService.lastCreateDto).toEqual({
        fullName: 'Super Admin',
        email: 'superadmin@bookingapp.com',
        password: 'SuperAdminPassword123@',
        role: UserRole.ADMIN,
      });
      expect(mockUsersService.lastCreateAllowAdmin).toBe(true);
      expect(result).toBe(mockAdminUser);
    });

    it('should use default values if config is not set', async () => {
      delete process.env.INITIAL_ADMIN_NAME;
      delete process.env.INITIAL_ADMIN_EMAIL;
      delete process.env.INITIAL_ADMIN_PASSWORD;

      await service.seedAdmin();

      expect(mockUsersService.lastFindByEmailCall).toBe('admin@bookingapp.com');
      expect(mockUsersService.lastCreateDto).toEqual({
        fullName: 'System Admin',
        email: 'admin@bookingapp.com',
        password: 'AdminPassword123@',
        role: UserRole.ADMIN,
      });
      expect(mockUsersService.lastCreateAllowAdmin).toBe(true);
    });

    it('should skip creation and return null if user with admin email already exists', async () => {
      mockConfigService.values['admin'] = {
        name: 'System Admin',
        email: 'admin@bookingapp.com',
        password: 'AdminPassword123@',
      };
      mockUsersService.findByEmailUser = mockAdminUser;

      const result = await service.seedAdmin();

      expect(result).toBeNull();
      expect(mockUsersService.lastFindByEmailCall).toBe('admin@bookingapp.com');
      expect(mockUsersService.lastFindAllRole).toBeUndefined();
      expect(mockUsersService.lastCreateDto).toBeUndefined();
    });

    it('should skip creation and return null if an ADMIN user already exists in system', async () => {
      mockConfigService.values['admin'] = {
        name: 'New Admin',
        email: 'newadmin@bookingapp.com',
        password: 'NewAdminPassword123@',
      };
      mockUsersService.findAllAdmins = [mockAdminUser];

      const result = await service.seedAdmin();

      expect(result).toBeNull();
      expect(mockUsersService.lastFindByEmailCall).toBe('newadmin@bookingapp.com');
      expect(mockUsersService.lastFindAllRole).toBe(UserRole.ADMIN);
      expect(mockUsersService.lastCreateDto).toBeUndefined();
    });
  });

  describe('onApplicationBootstrap', () => {
    it('should call seedAdmin on application bootstrap', async () => {
      let seedAdminCalled = false;
      service.seedAdmin = async () => {
        seedAdminCalled = true;
        return mockAdminUser;
      };

      await service.onApplicationBootstrap();

      expect(seedAdminCalled).toBe(true);
    });
  });
});
