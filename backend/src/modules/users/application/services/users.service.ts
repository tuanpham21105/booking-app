import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PasswordHasher } from '@nestjs/authentication';
import { User } from '../../domain/entities/user.entity';
import { UserRole } from '../../domain/enums/user-role.enum';
import { UserRepository } from '../../domain/repositories/user.repository.port';
import { CreateUserDto, ResetPasswordDto, UpdateUserDto } from '../dto';

@Injectable()
export class UsersService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly passwordHasher: PasswordHasher,
  ) {}

  /**
   * Tạo tài khoản người dùng mới (UC-01, UC-03, BR-01).
   * Ràng buộc BR-01: Không được phép tạo tài khoản có vai trò ADMIN.
   */
  async create(dto: CreateUserDto): Promise<User> {
    if (dto.role === UserRole.ADMIN) {
      throw new BadRequestException('Không được phép tạo tài khoản với vai trò Admin');
    }

    const existingUser = await this.userRepository.findByEmail(dto.email);
    if (existingUser) {
      throw new ConflictException('Email đã tồn tại trong hệ thống');
    }

    const passwordHash = await this.passwordHasher.hash(dto.password);
    const role = dto.role ?? UserRole.CUSTOMER;

    return await this.userRepository.create(
      dto.fullName,
      dto.email,
      passwordHash,
      role,
    );
  }

  /**
   * Lấy danh sách tài khoản phân trang, hỗ trợ tìm kiếm theo họ tên/email và lọc theo vai trò (UC-03).
   */
  async findAll(
    page: number = 1,
    limit: number = 10,
    search?: string,
    role?: UserRole,
  ): Promise<[User[], number]> {
    return await this.userRepository.findAll(page, limit, search, role);
  }

  /**
   * Lấy thông tin chi tiết một tài khoản theo ID (UC-03).
   */
  async findById(id: number): Promise<User> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new NotFoundException(`Không tìm thấy người dùng với ID ${id}`);
    }
    return user;
  }

  /**
   * Tìm người dùng theo địa chỉ email (Phục vụ xác thực / kiểm tra nội bộ).
   */
  async findByEmail(email: string): Promise<User | null> {
    return await this.userRepository.findByEmail(email);
  }

  /**
   * Cập nhật thông tin tài khoản (UC-03, BR-01).
   * Ràng buộc BR-01:
   * - Không được phép nâng quyền tài khoản khác lên ADMIN.
   * - Không được phép chỉnh sửa thông tin tài khoản ADMIN.
   */
  async update(id: number, dto: UpdateUserDto): Promise<User> {
    const user = await this.findById(id);

    if (dto.role === UserRole.ADMIN) {
      throw new BadRequestException('Không được phép nâng quyền tài khoản lên Admin');
    }

    if (user.role === UserRole.ADMIN) {
      throw new BadRequestException('Không được phép chỉnh sửa tài khoản Admin');
    }

    if (dto.email && dto.email !== user.email) {
      const userWithSameEmail = await this.userRepository.findByEmail(dto.email);
      if (userWithSameEmail && userWithSameEmail.id !== id) {
        throw new ConflictException('Email mới đã tồn tại trong hệ thống');
      }
      user.email = dto.email;
    }

    if (dto.fullName !== undefined) {
      user.fullName = dto.fullName;
    }

    if (dto.role !== undefined) {
      user.role = dto.role;
    }

    return await this.userRepository.save(user);
  }

  /**
   * Đặt lại mật khẩu tài khoản (UC-03, BR-01).
   * Ràng buộc BR-01: Không được phép thay đổi tài khoản ADMIN qua luồng này.
   */
  async resetPassword(id: number, dto: ResetPasswordDto): Promise<User> {
    const user = await this.findById(id);

    if (user.role === UserRole.ADMIN) {
      throw new BadRequestException('Không được phép đặt lại mật khẩu cho tài khoản Admin');
    }

    const passwordHash = await this.passwordHasher.hash(dto.newPassword);
    user.passwordHash = passwordHash;

    return await this.userRepository.save(user);
  }

  /**
   * Xóa tài khoản người dùng (UC-03, BR-01).
   * Ràng buộc BR-01: Không được phép xóa tài khoản Admin dưới bất kỳ hình thức nào.
   */
  async delete(id: number): Promise<boolean> {
    const user = await this.findById(id);

    if (user.role === UserRole.ADMIN) {
      throw new BadRequestException('Không được phép xóa tài khoản Admin');
    }

    return await this.userRepository.delete(id);
  }
}
