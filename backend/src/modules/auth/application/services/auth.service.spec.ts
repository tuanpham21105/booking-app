import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  ConflictException,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PasswordHasher, TokenService } from '@nestjs/authentication';
import { AuthService } from './auth.service';
import { UsersService } from '../../../users/application/services/users.service';
import { UserRole } from '../../../users/domain/enums/user-role.enum';
import { User } from '../../../users/domain/entities/user.entity';

class MockUsersService {
  users: User[] = [
    new User(
      'Existing Customer',
      'customer@example.com',
      'hashed_pwd_123',
      UserRole.CUSTOMER,
      1,
      new Date('2026-11-20T08:00:00.000Z'),
      new Date('2026-11-20T08:00:00.000Z'),
    ),
  ];

  shouldReturnUserWithoutId = false;

  async create(dto: {
    fullName: string;
    email: string;
    password: string;
    role?: UserRole;
  }): Promise<User> {
    const exists = this.users.find((u) => u.email === dto.email);
    if (exists) {
      throw new ConflictException('Email đã tồn tại trong hệ thống');
    }

    if (this.shouldReturnUserWithoutId) {
      return new User(
        dto.fullName,
        dto.email,
        'hashed_' + dto.password,
        dto.role ?? UserRole.CUSTOMER,
      );
    }

    const newUser = new User(
      dto.fullName,
      dto.email,
      'hashed_' + dto.password,
      dto.role ?? UserRole.CUSTOMER,
      this.users.length + 1,
      new Date('2026-11-26T10:00:00.000Z'),
      new Date('2026-11-26T10:00:00.000Z'),
    );
    this.users.push(newUser);
    return newUser;
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = this.users.find((u) => u.email === email);
    if (!user) return null;
    if (this.shouldReturnUserWithoutId) {
      return new User(
        user.fullName,
        user.email,
        user.passwordHash,
        user.role,
      );
    }
    return user;
  }

  async findById(id: number): Promise<User> {
    const user = this.users.find((u) => u.id === id);
    if (!user) {
      throw new NotFoundException(`Không tìm thấy người dùng với ID ${id}`);
    }
    if (this.shouldReturnUserWithoutId) {
      return new User(
        user.fullName,
        user.email,
        user.passwordHash,
        user.role,
      );
    }
    return user;
  }
}

class MockTokenService {
  lastIssuedId?: string;
  lastIssuedOptions?: { method?: string; claims?: { email?: string } };
  lastRefreshToken?: string;

  async issue(id: string, options?: { method?: string; claims?: { email?: string } }) {
    this.lastIssuedId = id;
    this.lastIssuedOptions = options;
    return {
      accessToken: `mock_access_token_${id}`,
      refreshToken: `mock_refresh_token_${id}`,
      expiresIn: 900,
    };
  }

  async refresh(refreshToken: string) {
    this.lastRefreshToken = refreshToken;
    if (refreshToken === 'valid_refresh_token') {
      return {
        accessToken: 'mock_new_access_token',
        refreshToken: 'mock_new_refresh_token',
        expiresIn: 900,
      };
    }
    throw new UnauthorizedException('Refresh Token không hợp lệ hoặc đã hết hạn');
  }
}

class MockPasswordHasher {
  lastVerifiedPassword?: string;
  lastVerifiedHash?: string | null;

  async verify(password: string, hash: string | null): Promise<boolean> {
    this.lastVerifiedPassword = password;
    this.lastVerifiedHash = hash;
    if (!hash) {
      return false;
    }
    return hash === 'hashed_pwd_123' && password === 'ValidPassword123@';
  }
}

describe('AuthService', () => {
  let authService: AuthService;
  let mockUsersService: MockUsersService;
  let mockTokenService: MockTokenService;
  let mockPasswordHasher: MockPasswordHasher;

  beforeEach(async () => {
    mockUsersService = new MockUsersService();
    mockTokenService = new MockTokenService();
    mockPasswordHasher = new MockPasswordHasher();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: mockUsersService },
        { provide: TokenService, useValue: mockTokenService },
        { provide: PasswordHasher, useValue: mockPasswordHasher },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(authService).toBeDefined();
  });

  describe('register', () => {
    it('should register a new customer successfully and return user with tokens and expiresIn', async () => {
      const result = await authService.register({
        fullName: 'Nguyễn Văn Mới',
        email: 'newuser@example.com',
        password: 'NewPassword123@',
      });

      expect(result.user.id).toBeDefined();
      expect(result.user.fullName).toBe('Nguyễn Văn Mới');
      expect(result.user.email).toBe('newuser@example.com');
      expect(result.user.role).toBe(UserRole.CUSTOMER);
      expect(result.accessToken).toBe(`mock_access_token_${result.user.id}`);
      expect(result.refreshToken).toBe(`mock_refresh_token_${result.user.id}`);
      expect(result.expiresIn).toBe(900);
      expect(mockTokenService.lastIssuedId).toBe(result.user.id.toString());
      expect(mockTokenService.lastIssuedOptions).toEqual({
        method: 'password',
        claims: { email: 'newuser@example.com' },
      });
    });

    it('should throw ConflictException when email is already registered', async () => {
      await expect(
        authService.register({
          fullName: 'Trùng Email',
          email: 'customer@example.com',
          password: 'Password123@',
        }),
      ).rejects.toThrow(ConflictException);
    });

    it('should throw InternalServerErrorException when user creation does not return an id', async () => {
      mockUsersService.shouldReturnUserWithoutId = true;

      await expect(
        authService.register({
          fullName: 'Không ID',
          email: 'noid@example.com',
          password: 'Password123@',
        }),
      ).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('login', () => {
    it('should login successfully with correct credentials and return user with tokens', async () => {
      const result = await authService.login({
        email: 'customer@example.com',
        password: 'ValidPassword123@',
      });

      expect(result.user.id).toBe(1);
      expect(result.user.fullName).toBe('Existing Customer');
      expect(result.user.email).toBe('customer@example.com');
      expect(result.user.role).toBe(UserRole.CUSTOMER);
      expect(result.accessToken).toBe('mock_access_token_1');
      expect(result.refreshToken).toBe('mock_refresh_token_1');
      expect(result.expiresIn).toBe(900);
      expect(mockTokenService.lastIssuedId).toBe('1');
      expect(mockTokenService.lastIssuedOptions).toEqual({
        method: 'password',
        claims: { email: 'customer@example.com' },
      });
    });

    it('should throw UnauthorizedException when email does not exist', async () => {
      await expect(
        authService.login({
          email: 'notfound@example.com',
          password: 'ValidPassword123@',
        }),
      ).rejects.toThrow(UnauthorizedException);

      expect(mockPasswordHasher.lastVerifiedPassword).toBe('ValidPassword123@');
      expect(mockPasswordHasher.lastVerifiedHash).toBeNull();
    });

    it('should throw UnauthorizedException when password is incorrect', async () => {
      await expect(
        authService.login({
          email: 'customer@example.com',
          password: 'WrongPassword!',
        }),
      ).rejects.toThrow(UnauthorizedException);

      expect(mockPasswordHasher.lastVerifiedPassword).toBe('WrongPassword!');
      expect(mockPasswordHasher.lastVerifiedHash).toBe('hashed_pwd_123');
    });

    it('should throw UnauthorizedException when user exists but does not have an id', async () => {
      mockUsersService.shouldReturnUserWithoutId = true;

      await expect(
        authService.login({
          email: 'customer@example.com',
          password: 'ValidPassword123@',
        }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('getProfile', () => {
    it('should return user profile when user exists with valid id', async () => {
      const profile = await authService.getProfile(1);

      expect(profile.id).toBe(1);
      expect(profile.fullName).toBe('Existing Customer');
      expect(profile.email).toBe('customer@example.com');
      expect(profile.role).toBe(UserRole.CUSTOMER);
      expect(profile.createdAt).toBeInstanceOf(Date);
      expect(profile.updatedAt).toBeInstanceOf(Date);
    });

    it('should fallback to current date when createdAt and updatedAt are null or undefined', async () => {
      mockUsersService.users.push(
        new User(
          'No Dates User',
          'nodates@example.com',
          'hashed_pwd',
          UserRole.CUSTOMER,
          2,
        ),
      );

      const profile = await authService.getProfile(2);
      expect(profile.id).toBe(2);
      expect(profile.createdAt).toBeInstanceOf(Date);
      expect(profile.updatedAt).toBeInstanceOf(Date);
    });

    it('should throw BadRequestException when userId is undefined', async () => {
      await expect(authService.getProfile(undefined)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException when userId is null', async () => {
      await expect(authService.getProfile(null)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException when userId is 0', async () => {
      await expect(authService.getProfile(0)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw NotFoundException when user does not exist', async () => {
      await expect(authService.getProfile(999)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw NotFoundException when user found has no id', async () => {
      mockUsersService.shouldReturnUserWithoutId = true;

      await expect(authService.getProfile(1)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('refresh', () => {
    it('should refresh tokens when refresh token is valid', async () => {
      const result = await authService.refresh({
        refreshToken: 'valid_refresh_token',
      });

      expect(result.accessToken).toBe('mock_new_access_token');
      expect(result.refreshToken).toBe('mock_new_refresh_token');
      expect(result.expiresIn).toBe(900);
      expect(mockTokenService.lastRefreshToken).toBe('valid_refresh_token');
    });

    it('should throw UnauthorizedException when refresh token is invalid', async () => {
      await expect(
        authService.refresh({ refreshToken: 'invalid_token' }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });
});
