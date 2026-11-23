# AGENTS.md - Backend Guidelines (NestJS 12 + Clean Architecture)

Tài liệu hướng dẫn cụ thể cho AI Agent khi làm việc trong thư mục `backend/`.

---

## 1. Công nghệ & Thư viện quy chuẩn

- **Framework**: NestJS v12 + TypeScript
- **Package Manager**: `pnpm` (bắt buộc)
- **Database**: **PostgreSQL 16-alpine**
- **ORM / Data Access**: **TypeORM** (`@nestjs/typeorm`, `typeorm`, `pg`)
- **Authentication**: **`@nestjs/authentication`** (NestJS official authentication package)
- **Validation**: `class-validator` + `class-transformer`
- **Documentation**: `@nestjs/swagger`
- **Linter**: `oxlint` (`pnpm lint`)
- **Unit Test**: Jest (`pnpm test`, `pnpm test:cov`), độ phủ Service / Use Case **$\ge 60\%$**

---

## 2. Kiến trúc Clean Architecture bổ dọc (Vertical Slice Clean Architecture)

Hệ thống được tổ chức theo module chức năng (Vertical Slices). Mỗi module tự đóng gói trọn vẹn các lớp của Clean Architecture:

```
backend/src/
├── main.ts
├── app.module.ts
│
├── common/                              # Tài nguyên dùng chung (Shared Kernel)
│   ├── domain/                          # Base Entity, Value Objects, Domain Errors, Interfaces
│   ├── application/                     # Base UseCase, Result/Either pattern, Common DTOs
│   ├── infrastructure/                  # TypeORM Base Repository, PostgreSQL 16 config, Logging
│   └── presentation/                    # Global Exception Filters, Pipes, Guards, Decorators
│
└── modules/
    └── <feature_name>/                  # Ví dụ: auth, services, bookings, providers
        ├── domain/                      # 1. Lõi nghiệp vụ (Domain Layer)
        │   ├── entities/                # Pure Domain Entities (không phụ thuộc TypeORM)
        │   ├── value-objects/           # Giá trị bất biến (Money, Email, TimeRange)
        │   ├── repositories/            # Repository Interfaces (Ports)
        │   └── exceptions/              # Lỗi nghiệp vụ chuyên biệt
        │
        ├── application/                 # 2. Logic ứng dụng (Application Layer)
        │   ├── use-cases/               # Use cases / Commands / Queries cụ thể
        │   ├── dto/                     # Application DTOs (Request / Response DTOs)
        │   └── ports/                   # External service interfaces (Email, Payment)
        │
        ├── infrastructure/              # 3. Hạ tầng & Cơ sở dữ liệu (Infrastructure Layer)
        │   ├── persistence/
        │   │   ├── entities/            # TypeORM Entity Schemas (ORM Entities)
        │   │   ├── mappers/             # Mapper chuyển đổi ORM Entity <-> Domain Entity
        │   │   └── repositories/        # TypeORM Repository Implementations (Adapters)
        │   └── adapters/                # External service implementations
        │
        ├── presentation/                # 4. Giao tiếp bên ngoài (Presentation Layer)
        │   ├── controllers/             # NestJS Controllers
        │   ├── dto/                     # Request validation DTOs (class-validator)
        │   └── presenters/              # Response view-models / Swagger schemas
        │
        └── <feature_name>.module.ts     # NestJS Module wiring dependencies
```

### Nguyên tắc phụ thuộc (Dependency Rule)
- `Domain` không phụ thuộc bất kỳ layer nào khác, không chứa decorator của TypeORM hay NestJS.
- `Application` chỉ phụ thuộc `Domain`.
- `Infrastructure` và `Presentation` phụ thuộc `Application` và `Domain`.
- Giao tiếp giữa `Application` và `Infrastructure` thông qua Repository Interfaces (Dependency Inversion).

---

## 3. Quy định về Authentication (`@nestjs/authentication`)

- Sử dụng package official `@nestjs/authentication`.
- Tách biệt logic xác thực (Auth Use Cases) tại `modules/auth/application/use-cases/`.
- Bảo vệ các endpoint bằng Guards và Decorators tại `common/presentation/`.

---

## 4. Quy định về Database & PostgreSQL 16-alpine

- Mọi entity database đều ánh xạ chuẩn xác với PostgreSQL 16.
- Sử dụng TypeORM Migrations để quản lý thay đổi schema, **không dùng `synchronize: true` trong môi trường production**.
- Luôn kiểm tra và xin phép Developer trước khi chạy sinh migration mới.

---

## 5. Lệnh kiểm tra bắt buộc (Verification Commands)

Trước khi bàn giao code:
```bash
pnpm lint        # Kiểm tra linter oxlint
pnpm build       # Biên dịch TypeScript
pnpm test:cov    # Chạy unit tests và kiểm tra coverage >= 60%
```
