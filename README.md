# Booking App (Hệ thống Đặt lịch Dịch vụ)

> **Lưu ý**: Đây là tài liệu mô tả sơ bộ tổng quan ban đầu của dự án. Các nội dung chi tiết về triển khai, hướng dẫn chạy dự án (Local run / Docker Compose) và tài liệu API sẽ được cập nhật liên tục trong các giai đoạn phát triển tiếp theo.

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
- **AI Agent Integration**: Hệ thống tài liệu chỉ dẫn và ranh giới an toàn cho AI Coding Assistant ([AGENTS.md](file:///home/tuan-pham/Documents/Work_Projects/TrinityTech/booking-app/AGENTS.md), [.agent/context/](file:///home/tuan-pham/Documents/Work_Projects/TrinityTech/booking-app/.agent/context))

---

## 3. Cấu trúc tổng thể dự án (Project Structure)

```
booking-app/
├── .agent/                  # Ngữ cảnh và quy định làm việc cho AI Agent
│   └── context/
│       └── 03-workflow-and-ai-rules.md  # Quy trình Git & mẫu khai báo AI
│
├── backend/                 # Phân hệ Backend (NestJS 12)
│   ├── src/
│   │   ├── common/          # Tài nguyên dùng chung (Shared Kernel theo Clean Architecture)
│   │   └── modules/         # Các lát cắt tính năng (Vertical Slice: Domain, Application, Infra, Presentation)
│   ├── test/                # Kiểm thử E2E và cấu hình Jest
│   ├── AGENTS.md            # Hướng dẫn chi tiết cho Agent khi làm việc ở Backend
│   └── package.json
│
├── frontend/                # Phân hệ Frontend (React 19 + Vite)
│   ├── src/
│   │   ├── components/      # UI components dùng chung toàn ứng dụng
│   │   ├── features/        # Các lát cắt tính năng độc lập (auth, services, bookings, staff)
│   │   ├── lib/             # Cấu hình Axios, React Query
│   │   └── routes/          # Hệ thống routing và Route Guards
│   ├── AGENTS.md            # Hướng dẫn chi tiết cho Agent khi làm việc ở Frontend
│   └── package.json
│
├── docs/                    # Tài liệu đề bài và hướng dẫn chuyên môn
│   └── Assignment.md
│
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
