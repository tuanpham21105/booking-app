import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PasswordHasher, TokenService } from '@nestjs/authentication';
import { UsersService } from '../../../users/application/services/users.service';
import { UserRole } from '../../../users/domain/enums/user-role.enum';
import {
  LoginRequestDto,
  RefreshTokenRequestDto,
  RegisterRequestDto,
  UserProfileResponseDto,
} from '../../presentation/dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly tokenService: TokenService,
    private readonly passwordHasher: PasswordHasher
  ) {}

  /**
   * Đăng ký tài khoản Khách hàng mới (UC-01).
   * Luôn gán vai trò CUSTOMER, mã hóa mật khẩu và trả về JWT tokens.
   */
  async register(dto: RegisterRequestDto) {
    const user = await this.usersService.create({
      fullName: dto.fullName,
      email: dto.email,
      password: dto.password,
      role: UserRole.CUSTOMER,
    });

    if (!user.id) {
      throw new InternalServerErrorException('Không lấy được ID người dùng sau khi tạo');
    }

    const tokens = await this.tokenService.issue(user.id.toString(), { method: 'password', claims: {email: user.email}});

    return {
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        role: user.role
      },
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      expiresIn: tokens.expiresIn
    };
  }

  /**
   * Đăng nhập hệ thống (UC-02).
   * Kiểm tra email và so khớp mật khẩu qua PasswordHasher.
   */
  async login(dto: LoginRequestDto) {
    const user = await this.usersService.findByEmail(dto.email);

    const isMatch = await this.passwordHasher.verify(dto.password, user ? user.passwordHash : null);
    if (!user || !user.id || !isMatch) {
      throw new UnauthorizedException('Email hoặc mật khẩu không chính xác');
    }

    const tokens = await this.tokenService.issue(user.id.toString(), { method: 'password', claims: {email: user.email}});

    return {
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        role: user.role
      },
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      expiresIn: tokens.expiresIn
    };
  }

  /**
   * Lấy hồ sơ tài khoản người dùng đang đăng nhập (GET /auth/me).
   */
  async getProfile(userId: number | undefined | null): Promise<UserProfileResponseDto> {
    if (!userId)
      throw new BadRequestException('Không lấy được ID người dùng');
    
    const user = await this.usersService.findById(userId);
    if (!user.id) {
      throw new NotFoundException('Không tìm thấy dữ liệu người dùng trong cơ sở dữ liệu');
    }

    return {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt ?? new Date(),
      updatedAt: user.updatedAt ?? new Date(),
    };
  }

  /**
   * Làm mới Access Token thông qua Refresh Token hợp lệ (Token Rotation).
   */
  async refresh(dto: RefreshTokenRequestDto) {
    return this.tokenService.refresh(dto.refreshToken);
  }
}
