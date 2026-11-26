# AI Agent Guide - Booking App

Chào mừng AI Agent! Đây là tài liệu hướng dẫn chuẩn (Root Agent Instruction) cho dự án **Booking App**.
Mọi Agent khi tham gia phát triển dự án này **bắt buộc phải đọc và tuân thủ các quy tắc dưới đây**.

---

## 1. Ranh giới an toàn & Ràng buộc nghiêm ngặt (Strict Agent Guardrails)

Dưới đây là các **lệnh cấm tuyệt đối** và nguyên tắc an toàn mà mọi Agent bắt buộc phải tuân theo:

### 1.1. Bảo mật & Biến môi trường (Environment & Security)
- **CẤM TUYỆT ĐỐI**: Không bao giờ được đọc, mở, sửa đổi hoặc hiển thị nội dung các file `.env`, `.env.*` (như `.env.local`, `.env.production`).
- **ĐƯỢC PHÉP**: Chỉ được phép đọc và cập nhật các file mẫu: `.env.example`, `.env.*.example`.
- **CẤM THU THẬP THÔNG TIN NHẠY CẢM**: Không quét, không thu thập, không ghi log và không lưu trữ bất kỳ thông tin nhạy cảm nào trong dự án (bao gồm: API keys, Secret tokens, Credentials, Mật khẩu, Connection strings, Thông tin người dùng).

### 1.2. Quyết định nghiệp vụ (Business Decisions)
- **CẤM TỰ SUY DIỄN**: Không được phép tự ý phỏng đoán hoặc tự quyết định các quy tắc nghiệp vụ khi chưa có yêu cầu rõ ràng.
- **BẮT BUỘC HỎI LẠI**: Mỗi khi phát hiện điểm thiếu rõ ràng, logic mâu thuẫn hoặc cần đưa ra quyết định về nghiệp vụ, Agent **bắt buộc phải dừng lại và hỏi người dùng** để được làm rõ trước khi viết code.

### 1.3. Kiểm soát phiên bản & Khai báo Pull Request (Git & PR Rules)
- **CẤM TUYỆT ĐỐI**: Không tự ý chạy các lệnh `git commit`, `git push`, `git merge`, `git rebase`, `git tag` hoặc bất kỳ hành động nào gửi code lên remote repository.
- **QUY TRÌNH CHUẨN**: Mọi hành động commit và push sẽ do Developer review lại thay đổi và tự thực hiện thủ công.
- **RÀNG BUỘC KHI TẠO MẪU KHAI BÁO PULL REQUEST (PR Guardrail)**:
  1. **Kiểm tra nhánh (Branch Guardrail)**: Khi Developer yêu cầu tạo mẫu khai báo PR, Agent **bắt buộc phải kiểm tra tên branch hiện tại**:
     - Nếu branch hiện tại là `main`, `develop` hoặc một branch không phải nhánh task: **Agent TUYỆT ĐỐI KHÔNG ĐƯỢC LÀM GÌ CẢ (không tạo mẫu khai báo PR)** mà phải dừng lại và **báo ngay cho Developer** rằng đang đứng ở nhánh chính (`main`/`develop`), không phải nhánh task nên không tạo Pull Request.
     - Nếu branch là nhánh task hợp lệ (ví dụ: `docs/BE-7-...`, `feat/...`, `fix/...`): Phân tích toàn bộ nội dung thay đổi trên branch hiện tại so với branch gốc (`develop`/`main`) để tạo báo cáo.
  2. **Cấu trúc mẫu khai báo PR bắt buộc**:
     - **Nguyên tắc trình bày**: Bắt buộc viết **tổng quan, ngắn gọn, súc tích (high-level, concise)**; tập trung vào mục tiêu và thay đổi cốt lõi, tránh liệt kê chi tiết vụn vặt từng hàm/từng file hay giải thích rườm rà.
     - **Tiêu đề Pull Request (PR Title)**: Đặt theo chuẩn Conventional Commits khớp mã task (ví dụ: `docs(BE-7): plan overview backend development roadmap`).
     - **Tổng quan thay đổi (Summary of Changes)**: Tóm lược súc tích toàn bộ diff thực tế trên branch hiện tại.
     - **Khai báo mức độ sử dụng AI**: Phân định rõ thành phần do AI sinh (AI-Generated) và vai trò định hướng/kiểm duyệt của Developer.
     - **Phương thức kiểm chứng (Verification Steps)**: Checklist ngắn gọn về linter, build, test coverage, an toàn dữ liệu và review thủ công.
  3. **Tự động tạo file trong `docs/pull_requests/`**: Khi Developer yêu cầu "mẫu khai báo pull request", Agent phải tự động phân tích toàn bộ thay đổi, tạo 1 file markdown (`.md`) chứa toàn bộ nội dung khai báo PR đặt trong thư mục `docs/pull_requests/` (đặt tên file theo mã task hoặc tên nhánh, ví dụ: `docs/pull_requests/<task-id>.md` hoặc `docs/pull_requests/<tên-nhánh>.md`), đồng thời xuất nội dung ra phản hồi kèm đường dẫn tương đối của file vừa tạo.
  4. Chi tiết xem tại: [.agents/context/01-workflow-and-ai-rules.md](.agents/context/01-workflow-and-ai-rules.md).

### 1.4. Quy định về đường dẫn (Relative Path Constraint)
- **BẮT BUỘC ĐƯỜNG DẪN TƯƠNG ĐỐI**: Mọi đường dẫn (paths) được nhắc đến hoặc sử dụng trong tài liệu, mã nguồn, liên kết Markdown (`[label](path)`), task log hoặc trao đổi với người dùng **bắt buộc phải luôn là đường dẫn tương đối tính từ thư mục gốc của dự án** (project root directory).
- **CẤM TUYỆT ĐỐI**: Không sử dụng đường dẫn tuyệt đối (absolute path, ví dụ: `/home/...`, `C:\...`, `file:///home/...`).

### 1.5. Quản lý tài liệu nhiệm vụ (Task Files Immutability)
- **CẤM TUYỆT ĐỐI**: Không bao giờ được chỉnh sửa, cập nhật, thay đổi hoặc xóa nội dung các file nhiệm vụ (`docs/tasks/*.md`, `tasks/*.md` hoặc bất kỳ file task nào trong dự án).
- **CHỈ ĐƯỢC PHÉP ĐỌC**: Các file task là đặc tả yêu cầu gốc do Developer / Product Owner giao phó; Agent chỉ được đọc (read-only) để nắm bắt yêu cầu triển khai, tuyệt đối không tự ý cập nhật kết quả, trạng thái hoặc ghi chú vào các file này.

### 1.6. Các ràng buộc an toàn gợi ý thêm (Recommended Best-Practice Guardrails)
- **Không phá vỡ Type-Safety**: Tuyệt đối không sử dụng `@ts-ignore`, `eslint-disable`, hoặc ép kiểu `any` tùy tiện chỉ để "lách" lỗi biên dịch hoặc linter.
- **Không tự ý cài đặt thư viện**: Trước khi chạy `pnpm add` hoặc `npm install` thêm package mới, phải giải thích lý do và hỏi ý kiến Developer.
- **Không xóa file hàng loạt**: Không chạy các lệnh xóa file hủy diệt (`rm -rf`, xóa database schema/tables) khi chưa có sự xác nhận của Developer.
- **Bảo toàn tính hồi quy**: Không làm hỏng các test case cũ đã pass.

---

## 2. Tổng quan kiến trúc hệ thống (System Architecture)

- **Backend**:
  - Framework: NestJS v12 + TypeScript, Package Manager: `pnpm`.
  - Database & ORM: **PostgreSQL 16-alpine**, kết nối và quản lý qua **TypeORM** (`@nestjs/typeorm`).
  - Authentication: **`@nestjs/authentication`** (official package mới của NestJS).
  - Kiến trúc: **Clean Architecture bổ dọc theo từng Module (Vertical Slice Clean Architecture)**.
    - Mỗi module bao gồm: `presentation`, `application`, `domain`, `infrastructure`.
    - Tài nguyên dùng chung đặt tại `src/common/` cũng tổ chức theo Clean Architecture.
  - Trạng thái phát triển: Đã hoàn thành **Giai đoạn 0: Khung Hạ tầng Dùng chung & Health Check**, **Giai đoạn 1: Quản lý Người dùng (`users`) & Khởi tạo Admin duy nhất**, **Giai đoạn 2: Xác thực & Phân quyền (Auth & RBAC Guards)**, và **Giai đoạn 3: Quản lý Nhà cung cấp (`providers`)**; lộ trình tiếp theo bám sát [docs/plans/backend_development_plan.md](docs/plans/backend_development_plan.md) (Giai đoạn 4: Danh mục Dịch vụ `services`).
  - Chi tiết xem tại: [backend/AGENTS.md](backend/AGENTS.md).
- **Frontend**:
  - React 19 + TypeScript + Vite 8.
  - Kiến trúc: **Feature-Based Architecture (Chuẩn Bulletproof React)**.
  - Chi tiết xem tại: [frontend/AGENTS.md](frontend/AGENTS.md).
- **Tài liệu quy trình & AI**:
  - [.agents/context/01-workflow-and-ai-rules.md](.agents/context/01-workflow-and-ai-rules.md): Quy trình Git, Guardrails và mẫu khai báo AI Attribution.
  - [.agents/context/02-backend-architecture-and-standards.md](.agents/context/02-backend-architecture-and-standards.md): Tiêu chuẩn kiến trúc Clean Architecture, quy chuẩn API, Database và Testing cho Backend.
  - [docs/task_conventions.md](docs/task_conventions.md): Quy ước đặt tên Task, Issue, Branch, Commit và Pull Request.

---

## 3. Tiêu chuẩn hoàn thành nhiệm vụ (Definition of Done - DoD)

Một nhiệm vụ chỉ được coi là hoàn tất khi AI Agent đảm bảo:
1. **Code chất lượng**: Đạt chuẩn TypeScript strict, không có `any` tùy tiện, pass lint (`pnpm lint` hoặc `npm run lint`).
2. **Không lỗi Build**: `pnpm build` (backend) và `npm run build` (frontend) biên dịch thành công 100%.
3. **Độ phủ Test Backend**: Unit test với Jest cho các service/use-case mới phải đạt độ phủ coverage >= 60%.
4. **Không tự ý commit**: Bàn giao diff sạch sẽ, chuẩn bị sẵn commit message và nội dung khai báo AI cho Developer duyệt.
