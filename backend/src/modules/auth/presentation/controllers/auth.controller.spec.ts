import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from '../../application/services/auth.service';
import { UserRole } from '../../../users/domain/enums/user-role.enum';
import {
  LoginRequestDto,
  LoginResponseDto,
  RefreshTokenRequestDto,
  RefreshTokenResponseDto,
  RegisterRequestDto,
  RegisterResponseDto,
  UserProfileResponseDto,
} from '../dto';
import { TokenService } from '@nestjs/authentication';

class MockAuthService {
  lastRegisterDto?: RegisterRequestDto;
  lastLoginDto?: LoginRequestDto;
  lastProfileUserId?: number | undefined | null;
  lastRefreshDto?: RefreshTokenRequestDto;

  async register(dto: RegisterRequestDto): Promise<RegisterResponseDto> {
    this.lastRegisterDto = dto;
    return {
      user: {
        id: 1,
        fullName: dto.fullName,
        email: dto.email,
        role: UserRole.CUSTOMER,
        createdAt: new Date(),
      },
      accessToken: 'mock_access_token',
      refreshToken: 'mock_refresh_token',
    };
  }

  async login(dto: LoginRequestDto): Promise<LoginResponseDto> {
    this.lastLoginDto = dto;
    return {
      user: {
        id: 1,
        fullName: 'Test User',
        email: dto.email,
        role: UserRole.CUSTOMER,
      },
      accessToken: 'mock_access_token',
      refreshToken: 'mock_refresh_token',
    };
  }

  async getProfile(userId: number | undefined | null): Promise<UserProfileResponseDto> {
    this.lastProfileUserId = userId;
    return {
      id: 1,
      fullName: 'Test User',
      email: 'test@bookingapp.com',
      role: UserRole.CUSTOMER,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  async refresh(dto: RefreshTokenRequestDto): Promise<RefreshTokenResponseDto> {
    this.lastRefreshDto = dto;
    return {
      accessToken: 'mock_new_access_token',
      refreshToken: 'mock_new_refresh_token',
    };
  }
}

class MockTokenService {
  async verifyAccessToken(_token: string) {
    return true;
  }
}

describe('AuthController', () => {
  let controller: AuthController;
  let mockAuthService: MockAuthService;

  beforeEach(async () => {
    mockAuthService = new MockAuthService();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        {
          provide: TokenService,
          useClass: MockTokenService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should register a new user', async () => {
    const dto = {
      fullName: 'Test User',
      email: 'test@bookingapp.com',
      password: 'Password123@',
    };
    const result = await controller.register(dto);
    expect(result.accessToken).toBe('mock_access_token');
    expect(mockAuthService.lastRegisterDto).toEqual(dto);
  });

  it('should login a user', async () => {
    const dto = {
      email: 'test@bookingapp.com',
      password: 'Password123@',
    };
    const result = await controller.login(dto);
    expect(result.accessToken).toBe('mock_access_token');
    expect(mockAuthService.lastLoginDto).toEqual(dto);
  });

  it('should get current user profile', async () => {
    const userPayload = {
      id: 1,
      email: 'test@bookingapp.com',
      role: UserRole.CUSTOMER,
    };
    const result = await controller.getProfile(userPayload);
    expect(result.id).toBe(1);
    expect(mockAuthService.lastProfileUserId).toBe(1);
  });

  it('should refresh tokens', async () => {
    const dto = { refreshToken: 'mock_refresh_token' };
    const result = await controller.refresh(dto);
    expect(result.accessToken).toBe('mock_new_access_token');
    expect(mockAuthService.lastRefreshDto).toEqual(dto);
  });
});
