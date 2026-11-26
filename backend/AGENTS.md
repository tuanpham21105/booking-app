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
- **Documentation**: `@nestjs/swagger` (OpenAPI tại `/api/docs`)
- **Linter**: `oxlint` (`pnpm lint`)
- **Kiểm thử (Testing)**: Jest (`pnpm test`, `pnpm test:cov`, `pnpm test:e2e`), độ phủ Service / Use Case **$\ge 60\%$**

---

## 2. Kiến trúc Clean Architecture bổ dọc (Vertical Slice Clean Architecture)

Hệ thống được tổ chức theo module chức năng (Vertical Slices). Mỗi module tự đóng gói trọn vẹn các lớp của Clean Architecture:

```
backend/src/
├── main.ts                              # Bootstrap, Global Prefix (/api/v1), Swagger (/api/docs), ValidationPipe, HttpExceptionFilter
├── app.module.ts                        # Root module điều phối
│
├── common/                              # Tài nguyên dùng chung (Shared Kernel)
│   ├── infrastructure/                  # Cấu hình đa môi trường (app, database, admin) & TypeORM DatabaseModule, DataSource
│   │   ├── config/                      # app.config.ts, database.config.ts, admin.config.ts
│   │   └── database/                    # database.module.ts, data-source.ts, migrations/
│   ├── presentation/                    # Global Exception Filters, DTOs chuẩn hóa phản hồi lỗi
│   │   ├── filters/                     # http-exception.filter.ts
│   │   └── dto/                         # error-message.dto.ts, validation-error-response.dto.ts
│   ├── utils/                           # entity-converter.util.ts, pagination.util.ts
│   └── common.module.ts                 # Export ConfigModule và DatabaseModule
│
└── modules/
    ├── health/                          # Phân hệ Health Check (Phase 0: GET /api/v1/health)
    │   ├── application/services/        # health.service.ts
    │   ├── presentation/controllers/    # health.controller.ts
    │   ├── presentation/dto/            # health-check-response.dto.ts
    │   └── health.module.ts
    ├── users/                           # Phân hệ Quản lý Người dùng (Phase 1: hoàn thiện CRUD & Seed Admin duy nhất)
    │   ├── domain/                      # Pure User Entity, UserRole Enum, UserRepository Port
    │   ├── application/                 # UsersService (CRUD, BR-01), AdminSeederService, DTOs
    │   ├── infrastructure/              # UserOrmEntity, TypeOrmUserRepository Adapter
    │   ├── presentation/                # UsersController (/api/v1/users), Swagger DTOs
    │   └── users.module.ts
    ├── auth/                            # Phân hệ Xác thực & Cấp quyền (Phase 2: JWT Access/Refresh, @nestjs/authentication & authorization)
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
    └── <feature_name>/                  # Các phân hệ tính năng tiếp theo (services, bookings, reports)
        ├── domain/                      # 1. Lõi nghiệp vụ (Domain Layer)
        │   ├── entities/                # Pure Domain Entities (không phụ thuộc TypeORM/NestJS)
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

## 3. Quy định về Global API Prefix & Chuẩn hóa lỗi

1. **Global Prefix**:
   - `src/main.ts` đã thiết lập tiền tố toàn cục `app.setGlobalPrefix('api/v1')`.
   - **Ràng buộc**: Khi viết Controller mới, chỉ khai báo `@Controller('users')`, `@Controller('auth')`... **CẤM TUYỆT ĐỐI** thêm tiền tố `api/v1/` vào decorator `@Controller()`.
   - Swagger UI được mount tại `/api/docs`.
2. **Global ValidationPipe**:
   - Mọi DTO tầng Presentation cần được validate đầy đủ bằng `class-validator` decorators (`@IsString()`, `@IsEmail()`, `@IsNotEmpty()`, v.v.) và khai báo Swagger `@ApiProperty()`.
3. **Chuẩn hóa phản hồi lỗi (Global HttpExceptionFilter)**:
   - Toàn bộ ngoại lệ HTTP đều được chuẩn hóa theo format JSON:
     ```json
     {
       "statusCode": 400,
       "message": "Validation failed",
       "error": "Bad Request",
       "timestamp": "2026-11-25T07:00:00.000Z",
       "path": "/api/v1/..."
     }
     ```
   - Agent cần sử dụng các Exception tiêu chuẩn của NestJS (`BadRequestException`, `UnauthorizedException`, `ForbiddenException`, `NotFoundException`, `ConflictException`, `InternalServerErrorException`).

---

## 4. Quy định về Authentication (`@nestjs/authentication`)

- Sử dụng package official `@nestjs/authentication`.
- Tách biệt logic xác thực (Auth Use Cases) tại `modules/auth/application/use-cases/`.
- Bảo vệ các endpoint bằng Guards và Decorators tại `common/presentation/`.

---

## 5. Quy định về Database, TypeORM & Migrations

- Mọi entity database đều ánh xạ chuẩn xác với PostgreSQL 16-alpine.
- DataSource cấu hình cho TypeORM CLI: `src/common/infrastructure/database/data-source.ts`.
- Thư mục lưu trữ migrations: `src/common/infrastructure/database/migrations/`.
- **Lệnh quản lý Migration**:
  - `pnpm migration:generate src/common/infrastructure/database/migrations/<TenMigration>`
  - `pnpm migration:create src/common/infrastructure/database/migrations/<TenMigration>`
  - `pnpm migration:run`
  - `pnpm migration:revert`
  - `pnpm migration:show`
- **An toàn dữ liệu**: Tuyệt đối **không** dùng `synchronize: true` trong môi trường production.
- Luôn kiểm tra và xin phép Developer trước khi chạy sinh migration mới.

---

## 6. Lệnh kiểm tra bắt buộc (Verification Commands)

Trước khi bàn giao code, Agent phải chạy và đảm bảo vượt qua toàn bộ các lệnh sau:
```bash
pnpm lint        # Kiểm tra linter oxlint (type-aware)
pnpm build       # Biên dịch TypeScript 100% không lỗi
pnpm test:cov    # Chạy unit tests và kiểm tra coverage >= 60%
pnpm test:e2e    # Chạy kiểm thử End-to-End
```

---

## 7. Tài liệu tham chiếu & Lộ trình phát triển

- **Lộ trình phát triển 8 giai đoạn**: [docs/plans/backend_development_plan.md](../docs/plans/backend_development_plan.md) (Hiện tại đã hoàn thành Phase 0 và Phase 1: Users Management & Seed Admin, tiếp theo là Phase 2: Auth & RBAC Security).
- **Tiêu chuẩn kiến trúc chi tiết**: [.agents/context/02-backend-architecture-and-standards.md](../.agents/context/02-backend-architecture-and-standards.md).
- **Quy trình Git & AI Guardrails**: [.agents/context/01-workflow-and-ai-rules.md](../.agents/context/01-workflow-and-ai-rules.md).
