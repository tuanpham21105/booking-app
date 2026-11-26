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
    └── <feature_name>/                  # Các phân hệ tiếp theo (auth, providers, services, bookings, reports)
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

### Các phân hệ API hiện tại:
- **Health Check (`/api/v1/health`)**:
  - `GET /api/v1/health`: Kiểm tra trạng thái máy chủ và kết nối PostgreSQL.
- **Quản lý Người dùng (`/api/v1/users`)**:
  - `GET /api/v1/users`: Danh sách tài khoản phân trang, tìm kiếm theo họ tên/email, lọc theo role (`ADMIN`, `STAFF`, `CUSTOMER`).
  - `GET /api/v1/users/:id`: Xem chi tiết thông tin một tài khoản.
  - `POST /api/v1/users`: Tạo tài khoản mới (`STAFF` hoặc `CUSTOMER`, cấm tạo `ADMIN` theo BR-01).
  - `PATCH /api/v1/users/:id`: Cập nhật thông tin tài khoản (cấm nâng quyền lên `ADMIN`, cấm sửa tài khoản `ADMIN` theo BR-01).
  - `PATCH /api/v1/users/:id/reset-password`: Đặt lại mật khẩu tài khoản (cấm sửa mật khẩu `ADMIN` theo BR-01).
  - `DELETE /api/v1/users/:id`: Xóa tài khoản người dùng (cấm xóa tài khoản `ADMIN` theo BR-01).

---

## 8. Hướng dẫn dành cho AI Agent & Developer

- Trước khi thực hiện thay đổi, vui lòng đọc kỹ:
  - [Root AGENTS.md](../AGENTS.md) - Ranh giới an toàn và quy tắc phát triển tổng thể.
  - [Backend AGENTS.md](./AGENTS.md) - Quy chuẩn chi tiết cho Backend.
  - [.agents/context/01-workflow-and-ai-rules.md](../.agents/context/01-workflow-and-ai-rules.md) - Quy trình Git và mẫu khai báo AI Attribution.
  - [.agents/context/02-backend-architecture-and-standards.md](../.agents/context/02-backend-architecture-and-standards.md) - Tiêu chuẩn kiến trúc Clean Architecture, quy chuẩn API, Database và Testing cho Backend.
