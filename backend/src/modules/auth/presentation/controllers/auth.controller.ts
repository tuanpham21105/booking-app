import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AuthService } from '../../application/services/auth.service';
import {
  LoginRequestDto,
  LoginResponseDto,
  RefreshTokenRequestDto,
  RefreshTokenResponseDto,
  RegisterRequestDto,
  RegisterResponseDto,
  UserProfileResponseDto,
} from '../dto';
import { ErrorMessageDto, ValidationErrorResponseDto } from '../../../../common/presentation/dto';
import { CurrentUser, Public } from '@nestjs/authentication';
import { AuthenticatedUserPayload } from '../../application/dto/authentication-user-payload.dto';
import { Can } from '@nestjs/authorization';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * Đăng ký tài khoản Khách hàng mới (UC-01).
   */
  @Public()
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Đăng ký tài khoản Khách hàng mới' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Đăng ký thành công, trả về thông tin tài khoản và cặp JWT tokens',
    type: RegisterResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Dữ liệu đầu vào không hợp lệ',
    type: ValidationErrorResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Email đã tồn tại trong hệ thống',
    type: ErrorMessageDto,
  })
  async register(@Body() dto: RegisterRequestDto) {
    return await this.authService.register(dto);
  }

  /**
   * Đăng nhập hệ thống (UC-02).
   */
  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Đăng nhập hệ thống' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Đăng nhập thành công, cấp cặp Access Token và Refresh Token',
    type: LoginResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Dữ liệu đầu vào không hợp lệ',
    type: ValidationErrorResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Sai thông tin email hoặc mật khẩu không khớp',
    type: ErrorMessageDto,
  })
  async login(@Body() dto: LoginRequestDto) {
    return await this.authService.login(dto);
  }

  /**
   * Lấy thông tin tài khoản hiện tại (GET /api/v1/auth/me).
   */
  @Get('me')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Lấy thông tin tài khoản đang đăng nhập' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Hồ sơ thông tin tài khoản người dùng đang đăng nhập',
    type: UserProfileResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Chưa đăng nhập, thiếu token hoặc token không hợp lệ/hết hạn',
    type: ErrorMessageDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Không tìm thấy dữ liệu người dùng trong cơ sở dữ liệu',
    type: ErrorMessageDto,
  })
  @Can.Anyone()
  async getProfile(@CurrentUser() user: AuthenticatedUserPayload,
  ): Promise<UserProfileResponseDto> {
    return await this.authService.getProfile(user.id);
  }

  /**
   * Làm mới Access Token thông qua Refresh Token (POST /api/v1/auth/refresh).
   */
  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Làm mới Access Token' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Làm mới token thành công, trả về cặp token mới',
    type: RefreshTokenResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Dữ liệu refresh token không hợp lệ',
    type: ValidationErrorResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Refresh token không hợp lệ, sai chữ ký hoặc đã hết hạn',
    type: ErrorMessageDto,
  })
  async refresh(
    @Body() dto: RefreshTokenRequestDto,
  ): Promise<RefreshTokenResponseDto> {
    return await this.authService.refresh(dto);
  }
}
