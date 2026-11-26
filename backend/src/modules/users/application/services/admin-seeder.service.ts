import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UsersService } from './users.service';
import { AdminConfig } from '../../../../common';
import { UserRole } from '../../domain/enums/user-role.enum';
import { User } from '../../domain/entities/user.entity';

@Injectable()
export class AdminSeederService implements OnApplicationBootstrap {
  private readonly logger = new Logger(AdminSeederService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly usersService: UsersService,
  ) {}

  async onApplicationBootstrap(): Promise<void> {
    await this.seedAdmin();
  }

  /**
   * Khởi tạo tài khoản Admin duy nhất khi chương trình chạy lần đầu.
   * Nếu tài khoản Admin hoặc email này đã tồn tại trong hệ thống thì bỏ qua để tránh trùng lặp.
   */
  async seedAdmin(): Promise<User | null> {
    const adminConfig = this.configService.get<AdminConfig>('admin');
    const name = adminConfig?.name ?? process.env.INITIAL_ADMIN_NAME ?? 'System Admin';
    const email = adminConfig?.email ?? process.env.INITIAL_ADMIN_EMAIL ?? 'admin@bookingapp.com';
    const password = adminConfig?.password ?? process.env.INITIAL_ADMIN_PASSWORD ?? 'AdminPassword123@';

    // 1. Kiểm tra xem người dùng với email này đã tồn tại chưa
    const existingByEmail = await this.usersService.findByEmail(email);
    if (existingByEmail) {
      this.logger.log(`Tài khoản người dùng với email '${email}' đã tồn tại. Bỏ qua khởi tạo Admin.`);
      return null;
    }

    // 2. Kiểm tra xem hệ thống đã tồn tại tài khoản với vai trò ADMIN chưa (BR-01)
    const [existingAdmins] = await this.usersService.findAll(1, 1, undefined, UserRole.ADMIN);
    if (existingAdmins.length > 0) {
      this.logger.log(
        `Hệ thống đã có tài khoản Admin (${existingAdmins[0]?.email}). Bỏ qua khởi tạo.`,
      );
      return null;
    }

    // 3. Khởi tạo tài khoản Admin duy nhất thông qua UsersService.create với cờ allowAdmin = true
    const adminUser = await this.usersService.create(
      {
        fullName: name,
        email,
        password,
        role: UserRole.ADMIN,
      },
      true,
    );

    this.logger.log(`Khởi tạo tài khoản Admin duy nhất thành công: ${email}`);
    return adminUser;
  }
}
