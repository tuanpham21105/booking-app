# Booking App - Frontend Client

Phân hệ giao diện người dùng (Frontend Client) cho hệ thống **Booking App** (Hệ thống Đặt lịch Dịch vụ), được xây dựng trên nền tảng **React 19**, **Vite 8**, **TypeScript**, và **Tailwind CSS + shadcn/ui** theo kiến trúc **Feature-Based (Chuẩn Bulletproof React)**.

---

## 1. Công nghệ sử dụng (Tech Stack)

- **Core Framework**: [React 19](https://react.dev/) + [Vite 8](https://vite.dev/) + TypeScript
- **Package Manager**: `npm`
- **UI Components**: **[shadcn/ui](https://ui.shadcn.com/)** (dựa trên Radix UI primitives và Tailwind CSS)
- **Styling**: Tailwind CSS
- **Data Fetching & Cache**: TanStack React Query (`@tanstack/react-query`)
- **HTTP Client**: Axios (`axios`) kèm JWT Interceptor
- **Icons**: Lucide React (`lucide-react`)
- **Linter & Code Quality**: ESLint (`eslint`)
- **Routing**: React Router với Route Guards

---

## 2. Kiến trúc Feature-Based (Bổ dọc theo tính năng)

Mã nguồn frontend được tổ chức đồng bộ với tư duy Clean Architecture bổ dọc của Backend: Mỗi tính năng nghiệp vụ được đóng gói độc lập trong một thư mục tại `src/features/`.

```
frontend/src/
├── assets/              # Hình ảnh, logo, vector SVG, fonts
├── components/          # UI Components
│   ├── ui/              # Component do shadcn sinh ra (Button, Dialog, Table, Input, v.v.)
│   └── shared/          # Component bố cục dùng chung (Navbar, Footer, Sidebar, Layout, ConfirmModal)
│
├── features/            # Các lát cắt tính năng độc lập (Feature Slices)
│   ├── auth/            # Tính năng Xác thực & Phân quyền
│   │   ├── api/         # Axios query/mutation functions (login, register, getMe)
│   │   ├── components/  # LoginForm, RegisterForm, ProtectedRoute
│   │   ├── hooks/       # useAuth, useLogin, useRegister
│   │   └── types/       # AuthUser, LoginRequest, AuthResponse
│   │
│   ├── services/        # Tính năng Khám phá dịch vụ (Customer)
│   │   ├── api/         # getServices, getServiceDetail, getCategories
│   │   ├── components/  # ServiceCard, ServiceFilter, ServiceList, ServiceDetail
│   │   ├── hooks/       # useServices, useServiceDetail
│   │   └── types/       # Service, ServiceFilterParams
│   │
│   ├── bookings/        # Tính năng Đặt lịch & Lịch sử đặt chỗ (Customer)
│   │   ├── api/         # createBooking, getBookingHistory, cancelBooking, getSlotAvailability
│   │   ├── components/  # SlotPicker, BookingCard, BookingHistoryList, CancelModal (ước tính phí hủy)
│   │   ├── hooks/       # useAvailableSlots, useBookings, useCancelBooking
│   │   └── types/       # Booking, TimeSlot, CancellationFeeEstimate
│   │
│   └── staff/           # Phân hệ Quản trị & Vận hành (Staff / Admin)
│       ├── api/         # updateBookingStatus, getStaffReports, manageServices, manageSlots
│   │   ├── components/  # BookingApprovalTable, RevenueChart, ServiceManageForm, SlotCapacityConfig
│   │   ├── hooks/       # useStaffBookings, useReports, useManageServices
│   │   └── types/       # StaffReport, BookingStatusUpdate, SlotCapacity
│   │
├── hooks/               # Custom hooks dùng chung toàn ứng dụng (useDebounce, useMediaQuery)
├── lib/                 # Khởi tạo Axios instance (JWT Interceptor), TanStack React Query Client
├── routes/              # Khai báo React Router & Guards (RequireAuth, RequireRole)
├── types/               # Kiểu dữ liệu TypeScript dùng chung (ApiResponse, PaginatedResult)
└── utils/               # Hàm tiện ích (formatVND, formatDate, calculateCancellationFee)
```

---

## 3. Các phân hệ người dùng & Luồng nghiệp vụ chính

### 3.1. Khách hàng (CUSTOMER)
- **Khám phá dịch vụ**: Tìm kiếm, lọc dịch vụ theo danh mục, mức giá và đánh giá.
- **Đặt lịch theo thời gian thực**: Chọn khung giờ (Time Slot) khả dụng; hệ thống kiểm soát chống đặt vượt quá số chỗ (anti-overbooking).
- **Quản lý lịch sử đặt chỗ**: Xem trạng thái booking (Chờ duyệt, Đã duyệt, Đã hoàn thành, Đã hủy).
- **Hủy lịch linh hoạt**: Xem trước mức phí hủy ước tính theo chính sách trước khi xác nhận hủy booking.

### 3.2. Nhân viên & Quản trị viên (STAFF / ADMIN)
- **Quản lý dịch vụ & khung giờ**: Tạo, chỉnh sửa thông tin dịch vụ, nhà cung cấp và cấu hình sức chứa/slot.
- **Xử lý booking**: Duyệt, từ chối hoặc hủy yêu cầu đặt chỗ từ khách hàng.
- **Báo cáo & Thống kê**: Biểu đồ thống kê số lượng booking theo trạng thái và doanh thu theo tháng.
- **Quản trị người dùng (Admin)**: Quản lý danh sách tài khoản và phân quyền vai trò.

---

## 4. Yêu cầu môi trường & Cài đặt (Prerequisites & Setup)

### Yêu cầu tiên quyết
- **Node.js**: phiên bản `>= 20.x` hoặc `>= 22.x`
- **npm**: phiên bản `>= 10.x`

### Cài đặt dependencies
Di chuyển vào thư mục `frontend/` và chạy lệnh:

```bash
npm install
```

### Cấu hình biến môi trường
Tạo file `.env` từ file mẫu `.env.example`:

```bash
cp .env.example .env
```

Các biến môi trường cơ bản:
- `VITE_API_BASE_URL`: Địa chỉ API Backend (ví dụ: `http://localhost:3000/api`)

---

## 5. Các lệnh thực thi (Available Scripts)

```bash
# Khởi chạy máy chủ phát triển Vite (hot reload tại http://localhost:5173)
npm run dev

# Biên dịch dự án sang mã nguồn tối ưu production (dist/)
npm run build

# Xem trước bản build production trên local
npm run preview

# Kiểm tra cú pháp và quy chuẩn code với ESLint
npm run lint
```

---

## 6. Quy chuẩn giao diện & Trải nghiệm người dùng (UI/UX)

- **Trạng thái tải dữ liệu**: Sử dụng Skeleton loader hoặc spinner khi truy vấn dữ liệu từ API.
- **Xác nhận hành động quan trọng**: Luôn hiển thị Dialog / Modal xác nhận trước khi thực hiện các hành động nguy hiểm (Hủy booking, Xóa dịch vụ).
- **Thông báo phản hồi (Feedback)**: Hiển thị Toast thông báo khi thực hiện thành công hoặc gặp lỗi.
- **Thiết kế thích ứng (Responsive)**: Tương thích hoàn chỉnh trên thiết bị di động (Mobile), máy tính bảng (Tablet) và máy tính để bàn (Desktop).

---

## 7. Hướng dẫn dành cho AI Agent & Developer

- Trước khi thực hiện thay đổi, vui lòng đọc kỹ:
  - [Root AGENTS.md](../AGENTS.md) - Ranh giới an toàn và quy tắc phát triển tổng thể.
  - [Frontend AGENTS.md](./AGENTS.md) - Quy chuẩn chi tiết cho Frontend.
  - [.agent/context/01-workflow-and-ai-rules.md](../.agent/context/01-workflow-and-ai-rules.md) - Quy trình Git và mẫu khai báo AI Attribution (Course 9).
