# Booking App (Hệ thống Đặt lịch Dịch vụ)

> **Lưu ý**: Đây là tài liệu mô tả tổng quan và hướng dẫn triển khai môi trường phát triển của dự án. Xem mục [5. Hướng dẫn khởi chạy môi trường Dev Local](#5-hướng-dẫn-khởi-chạy-môi-trường-dev-local-local-development-guide) để bắt đầu phát triển.

---

## 1. Tổng quan dự án (Project Overview)

**Booking App** là nền tảng quản lý và đặt lịch dịch vụ trực tuyến, phục vụ nhu cầu đặt chỗ của khách hàng và công tác vận hành của đội ngũ nhân viên/quản trị viên:

- **Khách hàng (CUSTOMER)**:
  - Khám phá, tìm kiếm và lọc danh sách dịch vụ theo nhu cầu.
  - Chọn khung giờ (Time Slot) khả dụng và đặt lịch theo thời gian thực (hệ thống kiểm soát sức chứa, ngăn chặn tình trạng đặt vượt quá số chỗ - anti-overbooking).
  - Quản lý lịch sử đặt chỗ cá nhân và thực hiện hủy lịch theo chính sách phí hủy linh hoạt.
- **Nhân viên (STAFF)**:
  - Quản lý thông tin dịch vụ, nhà cung cấp và cấu hình khung giờ / sức chứa phục vụ.
  - Tiếp nhận và xử lý các yêu cầu đặt chỗ (xác nhận, từ chối hoặc hủy).
  - Theo dõi báo cáo thống kê trực quan (số lượng booking theo trạng thái, doanh thu theo tháng).
- **Quản trị viên (ADMIN)**:
  - Quản trị toàn bộ tài khoản người dùng, phân quyền hệ thống (Role-Based Access Control).

---

## 2. Công nghệ sử dụng (Technology Stack)

Dự án được chia tách thành hai phân hệ độc lập (Backend và Frontend) với ngăn xếp công nghệ hiện đại:

### 2.1. Backend
- **Framework**: [NestJS](https://nestjs.com/) v12 (TypeScript)
- **Cơ sở dữ liệu**: **PostgreSQL 16-alpine**
- **ORM / Data Access**: **TypeORM** (`@nestjs/typeorm`)
- **Authentication**: **`@nestjs/authentication`** (official package mới của NestJS) kết hợp JWT
- **Data Validation & Docs**: `class-validator`, `class-transformer`, `@nestjs/swagger`
- **Kiểm thử & Linter**: Jest (độ phủ kiểm thử Service $\ge 60\%$), Oxlint
- **Package Manager**: `pnpm`

### 2.2. Frontend
- **Framework**: [React 19](https://react.dev/) + [Vite 8](https://vite.dev/) (TypeScript)
- **UI Components**: **[shadcn/ui](https://ui.shadcn.com/)** (Radix UI primitives)
- **Giao diện & Styling**: Tailwind CSS, Lucide React (Icons)
- **Data Fetching & State**: TanStack React Query (`@tanstack/react-query`), Axios
- **Package Manager**: `npm`

### 2.3. DevOps & Quy trình phát triển
- **Containerization**: Docker & Docker Compose (cho PostgreSQL 16 và toàn bộ môi trường ứng dụng)
- **AI Agent Integration**: Hệ thống tài liệu chỉ dẫn và ranh giới an toàn cho AI Coding Assistant ([AGENTS.md](AGENTS.md), [.agents/context/](.agents/context/))

---

## 3. Cấu trúc tổng thể dự án (Project Structure)

```
booking-app/
├── .agents/                 # Ngữ cảnh và quy định làm việc cho AI Agent
│   ├── context/
│   │   └── 01-workflow-and-ai-rules.md  # Quy trình Git & mẫu khai báo AI
│   └── skills/              # Kỹ năng bổ trợ cho AI Agent
│
├── backend/                 # Phân hệ Backend (NestJS 12)
│   ├── src/
│   │   ├── common/          # Tài nguyên dùng chung (Shared Kernel: config, database, filters, dto, utils)
│   │   ├── scripts/         # Script khởi tạo độc lập (seed-admin.ts)
│   │   └── modules/         # Các lát cắt tính năng (Vertical Slice)
│   │       ├── health/      # Phân hệ Health Check (giám sát server & CSDL)
│   │       ├── users/       # Phân hệ Quản lý Người dùng & Seed Admin duy nhất
│   │       ├── auth/        # Phân hệ Xác thực & Cấp quyền JWT (Access/Refresh Token)
│   │       └── providers/   # Phân hệ Quản lý Nhà cung cấp (đối tác dịch vụ)
│   ├── test/                # Kiểm thử E2E (app, health) và cấu hình Jest
│   ├── .env.example         # File biến môi trường mẫu cho Backend Dev
│   ├── AGENTS.md            # Hướng dẫn chi tiết cho Agent khi làm việc ở Backend
│   ├── Dockerfile.dev       # Dockerfile môi trường dev cho Backend
│   └── package.json
│
├── frontend/                # Phân hệ Frontend (React 19 + Vite)
│   ├── src/
│   │   ├── components/      # UI components dùng chung toàn ứng dụng
│   │   ├── features/        # Các lát cắt tính năng độc lập (auth, services, bookings, staff)
│   │   ├── lib/             # Cấu hình Axios, React Query
│   │   └── routes/          # Hệ thống routing và Route Guards
│   ├── AGENTS.md            # Hướng dẫn chi tiết cho Agent khi làm việc ở Frontend
│   ├── Dockerfile.dev       # Dockerfile môi trường dev cho Frontend
│   └── package.json
│
├── docs/                    # Tài liệu đề bài và hướng dẫn chuyên môn
│   └── Assignment.md
│
├── .env.dev.example         # File biến môi trường mẫu cho Docker Compose Dev
├── docker-compose.dev.yml   # File Docker Compose khởi chạy PostgreSQL 16, Backend và Frontend
├── AGENTS.md                # Quy tắc an toàn và chỉ dẫn gốc cho toàn bộ dự án
└── README.md                # Tài liệu tổng quan dự án
```

---

## 4. Định hướng kiến trúc phần mềm

1. **Backend - Clean Architecture bổ dọc (Vertical Slice)**:
   - Thay vì chia lớp ngang toàn hệ thống, mã nguồn được chia theo từng module nghiệp vụ độc lập.
   - Mỗi module tự đóng gói 4 tầng rõ ràng: `domain` (nghiệp vụ thuần túy), `application` (use cases), `infrastructure` (kết nối TypeORM và cơ sở dữ liệu), `presentation` (REST controllers và Swagger).
2. **Frontend - Feature-Based Architecture (Chuẩn Bulletproof React)**:
   - Các tài nguyên liên quan đến từng tính năng (giao diện, hooks gọi API, kiểu dữ liệu) được quy tụ về một thư mục trong `features/`, đảm bảo tính đồng bộ tư duy với backend và dễ mở rộng khi dự án lớn dần.

---

## 5. Hướng dẫn khởi chạy môi trường Dev Local (Local Development Guide)

Dự án cung cấp cấu hình [docker-compose.dev.yml](docker-compose.dev.yml) để khởi chạy toàn diện môi trường phát triển bao gồm: **PostgreSQL 16-alpine**, **Backend (NestJS 12)** và **Frontend (React 19 + Vite 8)**.

### 5.1. Yêu cầu hệ thống (Prerequisites)
- [Docker Engine](https://docs.docker.com/engine/install/) phiên bản $\ge 20.10$ hoặc [Docker Desktop](https://www.docker.com/products/docker-desktop/).
- [Docker Compose](https://docs.docker.com/compose/) phiên bản v2 trở lên (lệnh `docker compose`).
- *(Tùy chọn cho Hybrid Dev)*: Node.js 20+, `pnpm` (backend), `npm` (frontend).

### 5.2. Chuẩn bị biến môi trường (Environment Configuration)
Trước khi khởi chạy, tạo file cấu hình môi trường từ file mẫu [.env.dev.example](.env.dev.example):

```bash
cp .env.dev.example .env
```

> [!IMPORTANT]
> **Ranh giới an toàn**: Tuyệt đối **KHÔNG** commit các file `.env` hoặc file chứa secret lên Git repository. File `.gitignore` ở root và các phân hệ đã được cấu hình tự động loại trừ các file này.

Bảng các biến môi trường cấu hình cơ bản:
| Biến môi trường | Giá trị mặc định | Giải thích |
| :--- | :--- | :--- |
| `POSTGRES_USER` | `postgres` | Tên người dùng quản trị PostgreSQL |
| `POSTGRES_PASSWORD` | `postgres` | Mật khẩu truy cập PostgreSQL |
| `POSTGRES_DB` | `booking_db` | Tên cơ sở dữ liệu cho dự án |
| `POSTGRES_PORT` | `5432` | Cổng map ra máy host của PostgreSQL |
| `BACKEND_PORT` / `PORT` | `3000` | Cổng phục vụ API của NestJS Backend |
| `DB_HOST` | `postgres` | Tên hostname nội bộ của service database trong mạng Docker |
| `INITIAL_ADMIN_NAME` | `System Admin` | Họ tên tài khoản Quản trị viên khởi tạo |
| `INITIAL_ADMIN_EMAIL` | `admin@bookingapp.com` | Địa chỉ email của tài khoản Admin duy nhất |
| `INITIAL_ADMIN_PASSWORD` | `AdminPassword123@` | Mật khẩu tài khoản Admin khởi tạo |
| `FRONTEND_PORT` | `5173` | Cổng truy cập Web UI của React + Vite |
| `VITE_API_URL` | `http://localhost:3000/api/v1` | URL tiền tố API Backend mà Frontend sẽ gọi |

### 5.3. Khởi chạy toàn bộ hệ thống bằng Docker Compose

File `docker-compose.dev.yml` đã được cấu hình sẵn cơ chế **Volume Mounts**:
- Thư mục mã nguồn `backend` và `frontend` được mount trực tiếp vào container, hỗ trợ **Hot-reload / HMR** tức thì khi lưu code mà không cần build lại image.
- `node_modules` và `dist` được cách ly qua anonymous volume nhằm tránh xung đột binary giữa máy host và container Linux Alpine.

#### Lựa chọn 1: Khởi chạy nhanh (Tự động build image nếu chưa có và chạy nền)
```bash
docker compose -f docker-compose.dev.yml up -d --build
```

#### Lựa chọn 2: Tách biệt từng bước (Build image riêng, khởi động riêng)
1. **Bước 1: Build Docker Images cho Backend và Frontend**:
   ```bash
   docker compose -f docker-compose.dev.yml build
   ```
2. **Bước 2: Khởi động toàn bộ các dịch vụ**:
   ```bash
   docker compose -f docker-compose.dev.yml up -d
   ```

#### Theo dõi trạng thái & Logs:
- **Kiểm tra trạng thái các container**:
  ```bash
  docker compose -f docker-compose.dev.yml ps
  ```
- **Xem toàn bộ log thời gian thực**:
  ```bash
  docker compose -f docker-compose.dev.yml logs -f
  ```
- **Xem log riêng cho từng service**:
  ```bash
  docker compose -f docker-compose.dev.yml logs -f backend
  docker compose -f docker-compose.dev.yml logs -f frontend
  docker compose -f docker-compose.dev.yml logs -f postgres
  ```

#### Địa chỉ truy cập các dịch vụ:
- **Frontend App**: [http://localhost:5173](http://localhost:5173) (Hỗ trợ Fast Refresh / Hot Module Replacement)
- **Backend API**: [http://localhost:3000/api/v1](http://localhost:3000/api/v1) (Tiền tố API toàn cục `/api/v1`, NestJS Hot-reload)
- **Swagger UI**: [http://localhost:3000/api/docs](http://localhost:3000/api/docs) (Tài liệu OpenAPI tương tác trực tiếp)
- **Health Check**: [http://localhost:3000/api/v1/health](http://localhost:3000/api/v1/health) (Kiểm tra trạng thái server và kết nối PostgreSQL)
- **PostgreSQL Database**: `localhost:5432` (kết nối qua DBeaver, pgAdmin hoặc TablePlus với user: `postgres`, password: `postgres`, database: `booking_db`)

### 5.4. Các lệnh quản trị thường dùng
- **Dừng toàn bộ hệ thống**:
  ```bash
  docker compose -f docker-compose.dev.yml down
  ```
- **Dừng hệ thống và xóa toàn bộ dữ liệu database (Reset Database Volume)**:
  ```bash
  docker compose -f docker-compose.dev.yml down -v
  ```
- **Rebuild lại một service cụ thể (khi vừa cài thêm package/thư viện mới)**:
  ```bash
  # Rebuild Backend
  docker compose -f docker-compose.dev.yml up -d --build backend

  # Rebuild Frontend
  docker compose -f docker-compose.dev.yml up -d --build frontend
  ```
- **Chạy lệnh kiểm tra code (Lint / Test) bên trong container**:
  ```bash
  # Chạy linter backend
  docker compose -f docker-compose.dev.yml exec backend pnpm run lint

  # Chạy unit test backend
  docker compose -f docker-compose.dev.yml exec backend pnpm run test:cov

  # Chạy kiểm thử e2e backend
  docker compose -f docker-compose.dev.yml exec backend pnpm run test:e2e

  # Chạy linter frontend
  docker compose -f docker-compose.dev.yml exec frontend npm run lint
  ```

### 5.5. Chế độ phát triển kết hợp (Hybrid Development - Khuyên dùng)
Khi cần debug sâu từng dòng code bằng breakpoint IDE hoặc kiểm thử nhanh:
1. **Khởi động riêng PostgreSQL 16-alpine bằng Docker Compose**:
   ```bash
   docker compose -f docker-compose.dev.yml up -d postgres
   ```
2. **Khởi động Backend trên máy host (Terminal 1)**:
   ```bash
   cd backend
   pnpm install
   pnpm run start:dev
   ```
3. **Khởi động Frontend trên máy host (Terminal 2)**:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

