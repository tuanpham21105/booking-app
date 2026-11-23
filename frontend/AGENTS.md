# AGENTS.md - Frontend Guidelines (React 19 + Feature-Based Architecture)

Tài liệu hướng dẫn cụ thể cho AI Agent khi làm việc trong thư mục `frontend/`.

---

## 1. Công nghệ & Thư viện quy chuẩn

- **Framework**: React 19 + TypeScript + Vite 8
- **Package Manager**: `npm`
- **UI Components**: **shadcn/ui** (dựa trên Radix UI và Tailwind CSS)
- **Styling**: Tailwind CSS
- **Data Fetching & Cache**: TanStack React Query (`@tanstack/react-query`)
- **HTTP Client**: Axios (`axios`) với JWT Interceptor
- **Icons**: Lucide React (`lucide-react`)
- **Linter**: ESLint (`npm run lint`)
- **Build Tool**: Vite (`npm run build`)

---

## 2. Kiến trúc Feature-Based (Bổ dọc theo tính năng - Chuẩn Bulletproof React)

Dự án được tổ chức đồng bộ với tư duy Clean Architecture bổ dọc của Backend: Mỗi tính năng nghiệp vụ được đóng gói độc lập trong một thư mục tại `features/`.

```
frontend/src/
├── assets/              # Hình ảnh, logo, fonts
├── components/          # UI Components
│   ├── ui/              # Các component do shadcn sinh ra (Button, Dialog, Table, Input, v.v.)
│   └── shared/          # Các component bố cục dùng chung (Navbar, Footer, Sidebar, Layout)
│
├── features/            # Các lát cắt tính năng độc lập (Feature Slices)
│   ├── auth/            # Tính năng Xác thực
│   │   ├── api/         # Axios query/mutation functions (login, register)
│   │   ├── components/  # LoginForm, RegisterForm
│   │   ├── hooks/       # useAuth, useLogin, useRegister
│   │   └── types/       # AuthUser, LoginRequest, AuthResponse
│   │
│   ├── services/        # Tính năng Khám phá dịch vụ (Customer)
│   │   ├── api/         # getServices, getServiceDetail
│   │   ├── components/  # ServiceCard, ServiceFilter, ServiceList
│   │   ├── hooks/       # useServices, useServiceDetail
│   │   └── types/       # Service, ServiceFilterParams
│   │
│   ├── bookings/        # Tính năng Đặt lịch & Lịch sử (Customer)
│   │   ├── api/         # createBooking, getBookingHistory, cancelBooking
│   │   ├── components/  # SlotPicker, BookingCard, CancelModal (tính phí hủy)
│   │   ├── hooks/       # useAvailableSlots, useBookings, useCancelBooking
│   │   └── types/       # Booking, TimeSlot, CancellationFeeEstimate
│   │
│   └── staff/           # Phân hệ Quản trị (Staff / Admin)
│       ├── api/         # updateBookingStatus, getStaffReports, manageServices
│       ├── components/  # BookingApprovalTable, RevenueChart, ServiceManageForm
│       ├── hooks/       # useStaffBookings, useReports
│       └── types/       # StaffReport, BookingStatusUpdate
│
├── hooks/               # Custom hooks dùng chung toàn app (useDebounce, useMediaQuery)
├── lib/                 # Khởi tạo Axios instance (JWT Interceptor), React Query Client
├── routes/              # Khai báo React Router & Guards (RequireAuth, RequireRole)
├── types/               # Kiểu dữ liệu chung toàn hệ thống (ApiResponse, PaginatedResult)
└── utils/               # Formatters (formatVND, formatDate), constants
```

---

## 3. Quy chuẩn viết code & Ranh giới an toàn

1. **Ranh giới an toàn cho Agent**:
   - TUYỆT ĐỐI KHÔNG đọc/sửa file `.env` thật (chỉ dùng `.env.example`).
   - TUYỆT ĐỐI KHÔNG tự suy diễn nghiệp vụ (khi cần quyết định logic giao diện/tính phí/điều hướng, phải hỏi lại Developer).
   - TUYỆT ĐỐI KHÔNG chạy `git commit` hay `git push`.
2. **Type-Safety & React 19 Best Practices**:
   - Khai báo kiểu TypeScript rõ ràng cho Props và API response, không dùng `any`.
   - Sử dụng React Query để quản lý server state (loading, error, cache invalidation sau khi mutate).
   - Tự động gắn token `Authorization: Bearer <token>` vào request header qua Axios interceptor.
3. **Trải nghiệm người dùng (UX)**:
   - Xử lý đầy đủ trạng thái `isLoading` (Skeleton loader) và thông báo lỗi thân thiện.
   - Bắt buộc có Modal xác nhận trước các hành động quan trọng (Hủy booking, Xóa dữ liệu).

---

## 4. Lệnh kiểm tra bắt buộc (Verification Commands)

Trước khi bàn giao code:
```bash
npm run lint    # Kiểm tra ESLint
npm run build   # Biên dịch và kiểm tra lỗi TypeScript
```
