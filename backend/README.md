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
├── main.ts                              # Điểm khởi chạy ứng dụng (Bootstrap, Swagger, ValidationPipe)
├── app.module.ts                        # Root module điều phối
│
├── common/                              # Tài nguyên dùng chung (Shared Kernel)
│   ├── domain/                          # Base Entity, Value Objects, Domain Errors, Interfaces
│   ├── application/                     # Base UseCase, Result/Either pattern, Common DTOs
│   ├── infrastructure/                  # TypeORM Base Repository, PostgreSQL config, Logging
│   └── presentation/                    # Global Exception Filters, Pipes, Guards, Decorators
│
└── modules/
    └── <feature_name>/                  # Ví dụ: auth, services, bookings, providers, reports
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
- Sử dụng **TypeORM Migrations** để quản lý thay đổi schema.
- **Lưu ý**: Tuyệt đối không bật `synchronize: true` trong môi trường Production để bảo toàn dữ liệu.

---

## 7. Tài liệu API (Swagger UI)

Khi ứng dụng backend đang chạy, tài liệu OpenAPI / Swagger UI được tự động phát sinh tại:
- **URL**: `http://localhost:3000/api/docs`

---

## 8. Hướng dẫn dành cho AI Agent & Developer

- Trước khi thực hiện thay đổi, vui lòng đọc kỹ:
  - [Root AGENTS.md](../AGENTS.md) - Ranh giới an toàn và quy tắc phát triển tổng thể.
  - [Backend AGENTS.md](./AGENTS.md) - Quy chuẩn chi tiết cho Backend.
  - [.agent/context/01-workflow-and-ai-rules.md](../.agent/context/01-workflow-and-ai-rules.md) - Quy trình Git và mẫu khai báo AI Attribution (Course 9).
