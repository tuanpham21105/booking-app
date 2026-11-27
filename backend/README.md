# Booking App - Backend Service

Phân hệ dịch vụ Backend cho hệ thống **Booking App** (Hệ thống Đặt lịch Dịch vụ), được xây dựng trên nền tảng **NestJS v12** theo kiến trúc **Clean Architecture bổ dọc (Vertical Slice Clean Architecture)**.

---

## 1. Công nghệ sử dụng (Tech Stack)

- **Framework**: [NestJS](https://nestjs.com/) v12 + TypeScript
- **Package Manager**: `pnpm` (bắt buộc)
- **Cơ sở dữ liệu**: **PostgreSQL 16-alpine**
- **ORM / Persistence**: **TypeORM** (`@nestjs/typeorm`, `typeorm`, `pg`)
- **Authentication & Authorization**: **`@nestjs/authentication`** (official package mới của NestJS) kết hợp JWT và RBAC
- **Validation & Transformation**: `class-validator`, `class-transformer`
- **API Documentation**: `@nestjs/swagger` (OpenAPI)
- **Linter & Formatter**: `oxlint`, `prettier`
- **Kiểm thử (Testing)**: Jest (`ts-jest`), độ phủ kiểm thử Service/Use Case $\ge 60\%$

---

## 2. Kiến trúc Clean Architecture bổ dọc (Vertical Slice)

Hệ thống backend được tổ chức theo module chức năng (Vertical Slices). Mỗi module tự đóng gói trọn vẹn 4 tầng của Clean Architecture:

```
backend/src/
├── main.ts                              # Điểm khởi chạy ứng dụng (Bootstrap, Global Prefix /api/v1, Swagger, ValidationPipe, HttpExceptionFilter)
├── app.module.ts                        # Root module điều phối
│
├── common/                              # Tài nguyên dùng chung (Shared Kernel)
│   ├── infrastructure/                  # Cấu hình đa môi trường & TypeORM DatabaseModule
│   │   ├── config/                      # app.config.ts, database.config.ts, admin.config.ts
│   │   └── database/                    # database.module.ts, data-source.ts, migrations/
│   ├── presentation/                    # Global Exception Filters & DTOs
│   │   ├── filters/                     # http-exception.filter.ts
│   │   └── dto/                         # error-message.dto.ts, validation-error-response.dto.ts
│   ├── utils/                           # entity-converter.util.ts, pagination.util.ts
│   └── common.module.ts                 # Export ConfigModule và DatabaseModule
│
└── modules/
    ├── health/                          # Phân hệ Health Check (đã hoàn thiện ở Phase 0)
    │   ├── application/services/        # health.service.ts
    │   ├── presentation/controllers/    # health.controller.ts (GET /api/v1/health)
    │   ├── presentation/dto/            # health-check-response.dto.ts
    │   └── health.module.ts
    ├── users/                           # Phân hệ Quản lý Người dùng (đã hoàn thiện ở Phase 1)
    │   ├── domain/                      # User Entity, UserRole Enum, UserRepository Port
    │   ├── application/                 # UsersService (CRUD, BR-01), AdminSeederService (Seed Admin), DTOs
    │   ├── infrastructure/              # UserOrmEntity, TypeOrmUserRepository Adapter
    │   ├── presentation/                # UsersController (/api/v1/users), Swagger DTOs
    │   └── users.module.ts
    ├── auth/                            # Phân hệ Xác thực & Cấp quyền JWT (đã hoàn thiện ở Phase 2)
    │   ├── application/services/        # auth.service.ts, jwt.service.ts (JwtBearerProvider)
    │   ├── application/dto/             # authentication-user-payload.dto.ts
    │   ├── presentation/controllers/    # auth.controller.ts (register, login, me, refresh)
    │   ├── presentation/dto/            # request/response DTOs kèm validation
    │   └── auth.module.ts
    ├── providers/                       # Phân hệ Quản lý Nhà cung cấp (đã hoàn thiện ở Phase 3)
    │   ├── domain/                      # Provider Entity, ProviderRepository Port
    │   ├── application/                 # ProvidersService (CRUD, kiểm tra trùng tên), DTOs
    │   ├── infrastructure/              # ProviderOrmEntity, TypeOrmProviderRepository Adapter
    │   ├── presentation/                # ProvidersController (/api/v1/providers), Swagger DTOs
    │   └── providers.module.ts
    ├── services/                        # Phân hệ Danh mục Dịch vụ (đã hoàn thiện ở Phase 4)
    │   ├── domain/                      # Service Entity, ServiceRepository Port
    │   ├── application/                 # ServicesService (CRUD, kiểm tra tồn tại Provider), DTOs
    │   ├── infrastructure/              # ServiceOrmEntity, TypeOrmServiceRepository Adapter
    │   ├── presentation/                # ServicesController (/api/v1/services), Swagger DTOs
    │   └── services.module.ts
    ├── schedules/                       # Phân hệ Quản lý Lịch hẹn & Chỗ trống (đã hoàn thiện ở Phase 5)
    │   ├── domain/                      # Schedule Entity, ScheduleRepository Port
    │   ├── application/                 # SchedulesService (CRUD, BR-05, chặn ngày quá khứ), DTOs
    │   ├── infrastructure/              # ScheduleOrmEntity, TypeOrmScheduleRepository Adapter
    │   ├── presentation/                # SchedulesController (/api/v1/schedules), Swagger DTOs
    │   └── schedules.module.ts
    └── <feature_name>/                  # Các phân hệ tiếp theo (bookings, reports)
        ├── domain/                      # 1. Lõi nghiệp vụ (Domain Layer)
        │   ├── entities/                # Pure Domain Entities (không phụ thuộc framework/ORM)
        │   ├── value-objects/           # Giá trị bất biến (Money, Email, TimeRange, Capacity)
        │   ├── repositories/            # Repository Interfaces (Ports)
        │   └── exceptions/              # Lỗi nghiệp vụ chuyên biệt (OverbookingException, v.v.)
        │
        ├── application/                 # 2. Logic ứng dụng (Application Layer)
        │   ├── use-cases/               # Use cases / Commands / Queries cụ thể
        │   ├── dto/                     # Application Request / Response DTOs
        │   └── ports/                   # External service interfaces (Payment, Notification)
        │
        ├── infrastructure/              # 3. Hạ tầng & Cơ sở dữ liệu (Infrastructure Layer)
        │   ├── persistence/
        │   │   ├── entities/            # TypeORM Entity Schemas (ORM Entities)
        │   │   ├── mappers/             # Mapper chuyển đổi ORM Entity <-> Domain Entity
        │   │   └── repositories/        # TypeORM Repository Implementations (Adapters)
        │   └── adapters/                # Triển khai các external services
        │
        ├── presentation/                # 4. Giao tiếp bên ngoài (Presentation Layer)
        │   ├── controllers/             # NestJS Controllers xử lý HTTP Requests
        │   ├── dto/                     # Request validation DTOs (class-validator)
        │   └── presenters/              # Response View-Models / Swagger schemas
        │
        └── <feature_name>.module.ts     # NestJS Module wiring dependencies cho slice
```

### Nguyên tắc phụ thuộc (Dependency Rule)
- **Domain**: Độc lập hoàn toàn, không phụ thuộc NestJS, TypeORM hay bất kỳ thư viện bên ngoài nào.
- **Application**: Chỉ phụ thuộc Domain; điều phối use-case thông qua các Port/Interface.
- **Infrastructure & Presentation**: Đóng vai trò Adapters, phụ thuộc vào Application và Domain.
- Giao tiếp giữa `Application` và `Infrastructure` thông qua Repository Interfaces (Dependency Inversion Principle).

---

## 3. Yêu cầu môi trường & Cài đặt (Prerequisites & Setup)

### Yêu cầu tiên quyết
- **Node.js**: phiên bản `>= 20.x` hoặc `>= 22.x`
- **pnpm**: phiên bản `>= 9.x` (`npm install -g pnpm`)
- **PostgreSQL**: phiên bản 16 (khuyến nghị chạy qua Docker)

### Cài đặt dependencies
Di chuyển vào thư mục `backend/` và chạy lệnh:

```bash
pnpm install
```

### Cấu hình biến môi trường
Tạo file `.env` từ file mẫu `.env.example`:

```bash
cp .env.example .env
```

Các biến môi trường cơ bản cần cấu hình:
- `PORT`: Cổng chạy HTTP server (mặc định: `3000`)
- `DB_HOST`: Địa chỉ máy chủ PostgreSQL (mặc định: `localhost`)
- `DB_PORT`: Cổng PostgreSQL (mặc định: `5432`)
- `DB_USERNAME`: Tài khoản cơ sở dữ liệu
- `DB_PASSWORD`: Mật khẩu cơ sở dữ liệu
- `DB_DATABASE`: Tên database (ví dụ: `booking_app`)
- `INITIAL_ADMIN_NAME`: Họ và tên tài khoản Quản trị viên khởi tạo (mặc định: `System Admin`)
- `INITIAL_ADMIN_EMAIL`: Email của tài khoản Admin duy nhất (mặc định: `admin@bookingapp.com`)
- `INITIAL_ADMIN_PASSWORD`: Mật khẩu tài khoản Admin khởi tạo (mặc định: `AdminPassword123@`)
- `JWT_SECRET`: Khóa bí mật ký JWT token
- `JWT_EXPIRES_IN`: Thời gian hết hạn của JWT (ví dụ: `1d` hoặc `3600s`)
- `CORS_ORIGIN`: Domain frontend được phép truy cập (ví dụ: `http://localhost:5173`)

---

## 4. Các lệnh thực thi (Available Scripts)

```bash
# Khởi chạy chế độ phát triển (hot reload)
pnpm run start:dev

# Khởi chạy chế độ debug
pnpm run start:debug

# Biên dịch dự án sang JavaScript (dist/)
pnpm run build

# Khởi chạy môi trường production
pnpm run start:prod

# Kiểm tra linter với Oxlint (type-aware)
pnpm run lint

# Tự động định dạng code với Prettier
pnpm run format

# Quản lý Database Migrations (TypeORM)
pnpm run migration:create <duong_dan_file>         # Tạo file migration rỗng
pnpm run migration:generate <duong_dan_file>       # Tự động sinh migration từ Entity
pnpm run migration:run                             # Thực thi các migration đang chờ
pnpm run migration:revert                          # Hoàn tác migration gần nhất
pnpm run migration:show                            # Xem danh sách và trạng thái migrations

```

---

## 5. Kiểm thử (Testing)

Dự án sử dụng **Jest** cho toàn bộ hệ thống kiểm thử:

```bash
# Chạy unit tests
pnpm run test

# Chạy unit tests theo dõi thay đổi (watch mode)
pnpm run test:watch

# Chạy unit tests và xuất báo cáo độ phủ (Coverage Report)
pnpm run test:cov

# Chạy kiểm thử tích hợp đầu-cuối (End-to-End)
pnpm run test:e2e
```

> **Tiêu chuẩn chất lượng (DoD)**: Mọi Service / Use Case mới phải đạt độ phủ kiểm thử unit test $\ge 60\%$.

---

## 6. Cơ sở dữ liệu & Migrations (PostgreSQL 16)

- Mọi entity database đều ánh xạ chuẩn xác với PostgreSQL 16.
- Sử dụng **TypeORM Migrations** để quản lý thay đổi schema cơ sở dữ liệu.
- **Lưu ý bảo mật & an toàn dữ liệu**: Tuyệt đối không bật `synchronize: true` trong môi trường Production.
- **Thư mục lưu trữ migrations**: `src/common/infrastructure/database/migrations/`
- **File cấu hình DataSource cho CLI**: `src/common/infrastructure/database/data-source.ts`

### 6.1. Hướng dẫn tạo Migration

#### Cách 1: Tự động sinh migration từ Entity (Auto-generate Migration)
Sử dụng khi bạn đã cập nhật hoặc thêm mới các TypeORM Entity và muốn TypeORM tự động đối chiếu schema cơ sở dữ liệu để sinh câu lệnh migration:

```bash
# Cú pháp qua npm script (tự động build code trước khi chạy)
pnpm run migration:generate src/common/infrastructure/database/migrations/<TenMigration>

# Hoặc dùng TypeORM CLI trực tiếp
pnpm build
pnpm typeorm migration:generate src/common/infrastructure/database/migrations/<TenMigration> -d dist/common/infrastructure/database/data-source.js
```

*Ví dụ:*
```bash
pnpm run migration:generate src/common/infrastructure/database/migrations/CreateUsersTable
```

#### Cách 2: Tạo file migration rỗng (Blank Migration)
Sử dụng khi muốn tự viết thủ công các câu lệnh SQL DDL/DML tùy chỉnh trong phương thức `up()` và `down()`:

```bash
# Cú pháp qua npm script
pnpm run migration:create src/common/infrastructure/database/migrations/<TenMigration>

# Hoặc dùng TypeORM CLI trực tiếp
pnpm typeorm migration:create src/common/infrastructure/database/migrations/<TenMigration>
```

*Ví dụ:*
```bash
pnpm run migration:create src/common/infrastructure/database/migrations/SeedInitialRoles
```

### 6.2. Các lệnh quản lý Migration khác

```bash
# Thực thi tất cả migrations đang chờ (pending)
pnpm run migration:run
# hoặc: pnpm typeorm migration:run -d dist/common/infrastructure/database/data-source.js

# Hoàn tác migration gần nhất (revert)
pnpm run migration:revert
# hoặc: pnpm typeorm migration:revert -d dist/common/infrastructure/database/data-source.js

# Xem danh sách các migration đã chạy và chưa chạy
pnpm run migration:show
# hoặc: pnpm typeorm migration:show -d dist/common/infrastructure/database/data-source.js
```

---

## 7. Tài liệu API (Swagger UI)

- **Tiền tố API toàn cục (Global Prefix)**: Mọi endpoint API đều được định tuyến qua tiền tố `/api/v1` (được cấu hình tại `src/main.ts`).
- **Swagger UI**: Khi ứng dụng backend đang chạy, tài liệu OpenAPI / Swagger UI được tự động phát sinh tại:
  - **URL**: `http://localhost:3000/api/docs`
  - Hỗ trợ nút **Authorize** để gán Access Token (JWT Bearer) trực tiếp trên trình duyệt, tự động lưu token qua các lần tải lại trang (`persistAuthorization: true`) và hỗ trợ tìm kiếm API (`filter: true`).

### Các phân hệ API hiện tại:
- **Health Check (`/api/v1/health`)**:
  - `GET /api/v1/health`: Kiểm tra trạng thái máy chủ và kết nối PostgreSQL.
- **Xác thực & Cấp quyền (`/api/v1/auth`)**:
  - `POST /api/v1/auth/register`: Đăng ký tài khoản Khách hàng mới (Customer), cấp cặp Access & Refresh Token.
  - `POST /api/v1/auth/login`: Đăng nhập bằng Email/Password, cấp cặp Access Token & Refresh Token.
  - `GET /api/v1/auth/me`: Lấy hồ sơ tài khoản hiện tại (yêu cầu Bearer Access Token).
  - `POST /api/v1/auth/refresh`: Làm mới Access Token thông qua Refresh Token (Token Rotation).
- **Quản lý Người dùng (`/api/v1/users`)**:
  - `GET /api/v1/users`: Danh sách tài khoản phân trang, tìm kiếm theo họ tên/email, lọc theo role (`ADMIN`, `STAFF`, `CUSTOMER`).
  - `GET /api/v1/users/:id`: Xem chi tiết thông tin một tài khoản.
  - `POST /api/v1/users`: Tạo tài khoản mới (`STAFF` hoặc `CUSTOMER`, cấm tạo `ADMIN` theo BR-01).
  - `PATCH /api/v1/users/:id`: Cập nhật thông tin tài khoản (cấm nâng quyền lên `ADMIN`, cấm sửa tài khoản `ADMIN` theo BR-01).
  - `PATCH /api/v1/users/:id/reset-password`: Đặt lại mật khẩu tài khoản (cấm sửa mật khẩu `ADMIN` theo BR-01).
  - `DELETE /api/v1/users/:id`: Xóa tài khoản người dùng (cấm xóa tài khoản `ADMIN` theo BR-01).
- **Quản lý Nhà cung cấp (`/api/v1/providers`)**:
  - `GET /api/v1/providers`: Danh sách nhà cung cấp phân trang, tìm kiếm theo tên (quyền `STAFF`, `ADMIN`).
  - `GET /api/v1/providers/:id`: Xem chi tiết nhà cung cấp kèm danh sách dịch vụ trực thuộc.
  - `POST /api/v1/providers`: Thêm mới nhà cung cấp.
  - `PATCH /api/v1/providers/:id`: Cập nhật tên và mô tả nhà cung cấp.
  - `DELETE /api/v1/providers/:id`: Xóa nhà cung cấp (cascade xóa toàn bộ dịch vụ và lịch liên quan).
- **Danh mục Dịch vụ (`/api/v1/services`)**:
  - `GET /api/v1/services`: Xem & tìm kiếm danh sách dịch vụ phân trang, hỗ trợ lọc theo nhà cung cấp (`Public`).
  - `GET /api/v1/services/:id`: Xem chi tiết dịch vụ kèm nhà cung cấp và lịch hẹn (`Public`).
  - `POST /api/v1/services`: Tạo mới dịch vụ cho nhà cung cấp (quyền `STAFF`, `ADMIN`).
  - `PATCH /api/v1/services/:id`: Cập nhật tên, mô tả, giá niêm yết hoặc nhà cung cấp.
  - `DELETE /api/v1/services/:id`: Xóa dịch vụ (cascade xóa lịch hẹn và booking liên quan).
- **Quản lý Lịch hẹn & Chỗ trống (`/api/v1/schedules`)**:
  - `GET /api/v1/schedules`: Xem danh sách lịch hẹn phân trang, lọc theo dịch vụ, ngày cụ thể hoặc khoảng ngày (`Public`).
  - `GET /api/v1/schedules/:id`: Xem chi tiết lịch hẹn kèm số chỗ trống (`Public`).
  - `POST /api/v1/schedules`: Tạo mới lịch hẹn, tự động kiểm tra chống trùng/chồng lấn giờ theo BR-05 (quyền `STAFF`, `ADMIN`).
  - `PATCH /api/v1/schedules/:id`: Cập nhật khung giờ hoặc số chỗ, tự động kiểm tra chống chồng lấn (quyền `STAFF`, `ADMIN`).
  - `DELETE /api/v1/schedules/:id`: Xóa lịch hẹn và tự động dọn dẹp các booking liên kết (quyền `STAFF`, `ADMIN`).

---

## 8. Hướng dẫn dành cho AI Agent & Developer

- Trước khi thực hiện thay đổi, vui lòng đọc kỹ:
  - [Root AGENTS.md](../AGENTS.md) - Ranh giới an toàn và quy tắc phát triển tổng thể.
  - [Backend AGENTS.md](./AGENTS.md) - Quy chuẩn chi tiết cho Backend.
  - [.agents/context/01-workflow-and-ai-rules.md](../.agents/context/01-workflow-and-ai-rules.md) - Quy trình Git và mẫu khai báo AI Attribution.
  - [.agents/context/02-backend-architecture-and-standards.md](../.agents/context/02-backend-architecture-and-standards.md) - Tiêu chuẩn kiến trúc Clean Architecture, quy chuẩn API, Database và Testing cho Backend.
