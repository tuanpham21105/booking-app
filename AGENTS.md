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

### 1.3. Kiểm soát phiên bản (Git & Remote VCS)
- **CẤM TUYỆT ĐỐI**: Không tự ý chạy các lệnh `git commit`, `git push`, `git merge`, `git rebase`, `git tag` hoặc bất kỳ hành động nào gửi code lên remote repository.
- **QUY TRÌNH CHUẨN**: Mọi hành động commit và push sẽ do Developer review lại thay đổi và tự thực hiện thủ công.
- **TRÁCH NHIỆM CỦA AGENT**: Sau khi hoàn thành code và tự kiểm tra (build/lint/test pass), Agent soạn sẵn:
  1. Gợi ý thông điệp commit chuẩn (Conventional Commits: `feat: ...`, `fix: ...`).
  2. Báo cáo khai báo AI cho Pull Request (theo mẫu tại [.agent/context/03-workflow-and-ai-rules.md](file:///home/tuan-pham/Documents/Work_Projects/TrinityTech/booking-app/.agent/context/03-workflow-and-ai-rules.md)).

### 1.4. Các ràng buộc an toàn gợi ý thêm (Recommended Best-Practice Guardrails)
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
  - Chi tiết xem tại: [backend/AGENTS.md](file:///home/tuan-pham/Documents/Work_Projects/TrinityTech/booking-app/backend/AGENTS.md).
- **Frontend**:
  - React 19 + TypeScript + Vite 8.
  - Đang trong quá trình chốt phương án kiến trúc (Feature-Based vs Clean Architecture).
  - Chi tiết xem tại: [frontend/AGENTS.md](file:///home/tuan-pham/Documents/Work_Projects/TrinityTech/booking-app/frontend/AGENTS.md).
- **Tài liệu quy trình & AI**:
  - [.agent/context/03-workflow-and-ai-rules.md](file:///home/tuan-pham/Documents/Work_Projects/TrinityTech/booking-app/.agent/context/03-workflow-and-ai-rules.md).

---

## 3. Tiêu chuẩn hoàn thành nhiệm vụ (Definition of Done - DoD)

Một nhiệm vụ chỉ được coi là hoàn tất khi AI Agent đảm bảo:
1. **Code chất lượng**: Đạt chuẩn TypeScript strict, không có `any` tùy tiện, pass lint (`pnpm lint` hoặc `npm run lint`).
2. **Không lỗi Build**: `pnpm build` (backend) và `npm run build` (frontend) biên dịch thành công 100%.
3. **Độ phủ Test Backend**: Unit test với Jest cho các service/use-case mới phải đạt độ phủ coverage >= 60%.
4. **Không tự ý commit**: Bàn giao diff sạch sẽ, chuẩn bị sẵn commit message và nội dung khai báo AI cho Developer duyệt.
