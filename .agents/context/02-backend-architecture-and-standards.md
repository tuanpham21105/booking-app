# Tiêu chuẩn Kiến trúc & Hướng dẫn Phát triển Backend (Backend Architecture & Standards)

Tài liệu này xác lập các tiêu chuẩn kỹ thuật, cấu trúc mã nguồn, quy chuẩn API, cơ sở dữ liệu và kiểm thử dành cho AI Agent và Developer khi phát triển phân hệ **Backend** (NestJS 12 + TypeScript + PostgreSQL 16 + TypeORM).

---

## 1. Kiến trúc Clean Architecture bổ dọc (Vertical Slice)

Backend được tổ chức theo module chức năng (Vertical Slice). Thay vì phân tầng ngang toàn hệ thống, mỗi module tính năng tự đóng gói trọn vẹn 4 tầng:

```
src/modules/<feature_name>/
├── domain/                      # 1. Lõi nghiệp vụ (Domain Layer)
│   ├── entities/                # Pure Domain Entities (Không chứa decorator của TypeORM hay NestJS)
│   ├── value-objects/           # Value Objects bất biến (Email, Money, TimeRange, v.v.)
│   ├── repositories/            # Repository Interfaces / Ports (Định nghĩa hợp đồng truy xuất dữ liệu)
│   └── exceptions/              # Domain Exceptions chuyên biệt (EntityNotFoundException, ConflictException)
│
├── application/                 # 2. Logic ứng dụng (Application Layer)
│   ├── use-cases/               # Use Case classes thực thi nghiệp vụ (Commands / Queries)
│   ├── dto/                     # Application DTOs (Request / Response DTOs nội bộ)
│   └── ports/                   # External Service Interfaces (TokenService, MailService)
│
├── infrastructure/              # 3. Hạ tầng & Cơ sở dữ liệu (Infrastructure Layer)
│   ├── persistence/
│   │   ├── entities/            # TypeORM Entity Schemas (@Entity, @Column, @ManyToOne, v.v.)
│   │   ├── mappers/             # Mapper chuyển đổi 2 chiều: TypeORM Entity <-> Domain Entity
│   │   └── repositories/        # TypeORM Repository Adapters (Hiện thực Repository Interface từ Domain)
│   └── adapters/                # Triển khai các external services
│
├── presentation/                # 4. Giao diện ngoại vi (Presentation Layer)
│   ├── controllers/             # NestJS Controllers xử lý HTTP Requests
│   ├── dto/                     # Request Validation DTOs (class-validator)
│   └── presenters/              # Response View-Models / Swagger schemas
│
└── <feature_name>.module.ts     # Module NestJS liên kết các dependencies của slice
```

### Nguyên tắc phụ thuộc bất biến (Dependency Rule) & Liên kết tinh gọn
1. **Domain**: Hoàn toàn độc lập, không import `@nestjs/*`, `typeorm` hay bất kỳ thư viện bên ngoài nào.
2. **Application**: Chỉ phụ thuộc vào `Domain`; tương tác với tầng ngoài qua Port/Interface.
3. **Infrastructure & Presentation**: Đóng vai trò Adapters, phụ thuộc vào `Application` và `Domain`.
4. **Không bỏ qua Mapper**: TypeORM Entity chỉ sống ở Infrastructure; Controller/UseCase chỉ làm việc với Domain Entity hoặc DTO.
5. **Tái sử dụng Domain Entity giữa các Module (Tránh Over-engineering)**: Cho phép sử dụng xen lẫn các Pure Domain Entity giữa các module chức năng (ví dụ `Provider` chứa `services?: Service[]`, `Service` chứa `provider?: Provider`). Không duplicate entity/interface phụ gây phức tạp hóa mã nguồn.
6. **Bảo vệ API & Decorator `@Public()`**: Mặc định `@nestjs/authentication` chặn mọi request không kèm token. Bất kỳ API public nào (`/health`, `/auth/login`, `/auth/register`, `/services`, v.v.) bắt buộc phải gắn `@Public()` từ `@nestjs/authentication`.

---

## 2. Tài nguyên dùng chung (`src/common/`)

Các thành phần dùng chung (Shared Kernel) đã được thiết lập sẵn từ Giai đoạn 0:

- **`src/common/infrastructure/config/`**:
  - `app.config.ts`: Cấu hình ứng dụng (`PORT`, `NODE_ENV`).
  - `database.config.ts`: Cấu hình PostgreSQL (`host`, `port`, `username`, `password`, `database`).
  - `admin.config.ts`: Cấu hình tài khoản Admin khởi tạo duy nhất (`INITIAL_ADMIN_NAME`, `INITIAL_ADMIN_EMAIL`, `INITIAL_ADMIN_PASSWORD`).
- **`src/common/utils/`**:
  - `entity-converter.util.ts`: Tiện ích ánh xạ dữ liệu giữa Domain Entity và ORM Entity.
  - `pagination.util.ts`: Tiện ích chuẩn hóa phân trang.
- **`src/common/infrastructure/database/`**:
  - `database.module.ts`: Khởi tạo `TypeOrmModule.forRootAsync` nạp cấu hình tự động.
  - `data-source.ts`: Cấu hình DataSource độc lập cho TypeORM CLI chạy migrations.
- **`src/common/presentation/filters/`**:
  - `http-exception.filter.ts`: Bắt toàn bộ `HttpException` và ngoại lệ không lường trước, chuẩn hóa định dạng lỗi JSON.
- **`src/common/presentation/dto/`**:
  - `error-message.dto.ts`: Định nghĩa schema thông báo lỗi Swagger.
  - `validation-error-response.dto.ts`: Định dạng chi tiết phản hồi lỗi validation.
- **`src/common/common.module.ts`**:
  - Đóng gói và export `ConfigModule` (global) và `DatabaseModule`.

---

## 3. Quy chuẩn API & Giao tiếp HTTP

### 3.1. Tiền tố toàn cục (Global Prefix)
Ứng dụng đã kích hoạt `app.setGlobalPrefix('api/v1')` tại `backend/src/main.ts`.
- **Quy tắc bắt buộc**: Khi khai báo Controller, chỉ dùng tên tài nguyên tương đối:
  ```typescript
  @Controller('users')       // Đúng -> URL thực tế: /api/v1/users
  @Controller('api/v1/users') // SAI -> Sẽ bị trùng lặp: /api/v1/api/v1/users
  ```

### 3.2. Tài liệu hóa Swagger UI (`/api/docs`)
- Mọi Controller cần có `@ApiTags('<Tên_Nhóm>')`.
- Mọi endpoint cần có `@ApiOperation({ summary: '...' })`, `@ApiResponse({ status: 200, ... })`.
- Mọi DTO cần gắn `@ApiProperty({ description: '...', example: '...' })`.

### 3.3. Validation DTO
- Tự động kiểm tra tham số qua Global `ValidationPipe`.
- Sử dụng decorators của `class-validator`: `@IsNotEmpty()`, `@IsEmail()`, `@IsString()`, `@MinLength()`, `@IsNumber()`, `@Min()`, v.v.

### 3.4. Chuẩn hóa phản hồi lỗi (Error Response Contract)
Toàn bộ phản hồi lỗi từ hệ thống tuân thủ cấu trúc:
```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "error": "Bad Request",
  "timestamp": "2026-11-25T07:00:00.000Z",
  "path": "/api/v1/users"
}
```
**Quy tắc**: Ném đúng mã lỗi NestJS:
- `BadRequestException` (400): Dữ liệu đầu vào sai định dạng.
- `UnauthorizedException` (401): Thiếu token hoặc token hết hạn/không hợp lệ.
- `ForbiddenException` (403): Không có quyền truy cập tài nguyên (sai role, IDOR).
- `NotFoundException` (404): Không tìm thấy bản ghi.
- `ConflictException` (409): Trùng lặp dữ liệu (email trùng, trùng lịch BR-05, hết chỗ BR-02).

---

## 4. Quy chuẩn Cơ sở dữ liệu & TypeORM Migrations

- **Hệ quản trị CSDL**: **PostgreSQL 16-alpine**.
- **Không dùng `synchronize: true`**: Luôn dùng migrations để đồng bộ thay đổi schema.
- **Thư mục lưu trữ migrations**: `src/common/infrastructure/database/migrations/`.
- **DataSource CLI**: `src/common/infrastructure/database/data-source.ts`.
- **Quy trình sinh migration**:
  ```bash
  # Sinh migration tự động đối chiếu từ TypeORM Entity
  pnpm run migration:generate src/common/infrastructure/database/migrations/<TenMigration>

  # Thực thi migration
  pnpm run migration:run

  # Hoàn tác migration gần nhất
  pnpm run migration:revert

  # Kiểm tra trạng thái migrations
  pnpm run migration:show
  ```
- **Ranh giới an toàn**: Agent luôn phải hỏi ý kiến Developer trước khi chạy sinh migration.

---

## 5. Quy chuẩn Kiểm thử (Testing) & Definition of Done

Mỗi khi phát triển Use Case hoặc Service mới, Agent bắt buộc phải đảm bảo:
1. **Unit Test độc lập**:
   - Viết unit test bằng Jest (`ts-jest`) cho Use Case và Service.
   - Mocking hoàn toàn Repository thông qua Interface/Port (sử dụng in-memory Map hoặc Jest Mock), không phụ thuộc database thật.
   - Độ phủ Unit Test cho Service / Use Case **$\ge 60\%$**.
2. **End-to-End Test (E2E)**:
   - Viết E2E test cho các luồng quan trọng trong thư mục `test/` (ví dụ `test/health.e2e-spec.ts`).
3. **Bộ lệnh kiểm tra bắt buộc trước bàn giao**:
   ```bash
   pnpm lint        # Kiểm tra linter oxlint (0 error, 0 warning)
   pnpm build       # Biên dịch TypeScript thành công 100%
   pnpm test:cov    # Kiểm tra coverage đạt >= 60%
   pnpm test:e2e    # Toàn bộ E2E tests pass
   ```

---

## 6. Lộ trình triển khai tổng thể (Roadmap Reference)

Lộ trình phát triển được định nghĩa chi tiết tại [docs/plans/backend_development_plan.md](docs/plans/backend_development_plan.md) theo nguyên tắc Dependency-Driven:

| Giai đoạn (Phase) | Tên phân hệ | Trạng thái | Trọng tâm nghiệp vụ |
| :--- | :--- | :---: | :--- |
| **Phase 0** | Hạ tầng dùng chung & Health Check | **Hoàn thành** | Khung Clean Architecture, Database connection, Swagger, Global Filter, `GET /api/v1/health` |
| **Phase 1** | Quản lý Người dùng (`users`) | **Hoàn thành** | Thực thể `users`, tài khoản Admin duy nhất (BR-01), Admin CRUD users, Seed Admin |
| **Phase 2** | Xác thực & Phân quyền (Auth & RBAC) | **Hoàn thành** | Sử dụng `@nestjs/authentication` (`JwtBearerProvider`, `TokenService`) & `@nestjs/authorization` (`RolePolicy`) tinh gọn theo định hướng review của Developer |
| **Phase 3** | Quản lý Nhà cung cấp (`providers`) | **Hoàn thành** | Quản lý đối tác dịch vụ, CRUD providers tinh gọn tương tự `users` |
| **Phase 4** | Danh mục Dịch vụ (`services`) | **Tiếp theo** | Danh mục dịch vụ theo nhà cung cấp, tìm kiếm public |
| **Phase 5** | Lịch hẹn & Chỗ trống (`schedules`) | Chờ | Sức chứa `total_slots`, chỗ trống, thuật toán chống trùng lịch BR-05 |
| **Phase 6** | Đặt chỗ & Vòng đời Booking (`bookings`) | Chờ | Giao dịch lõi, giữ chỗ BR-02, máy trạng thái, chính sách phí hủy BR-03 |
| **Phase 7** | Báo cáo & Thống kê (`reports`) | Chờ | Thống kê theo trạng thái, báo cáo doanh thu 12 tháng |
| **Phase 8** | Xóa liên kết Demo & System Hardening | Chờ | Cascade Deletion BR-04, Demo Seed Data đầy đủ, E2E Testing toàn diện |
