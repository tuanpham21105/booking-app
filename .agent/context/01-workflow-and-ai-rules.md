# Quy trình Git & Khai báo AI (Course 9 Attribution Rules)

Tài liệu này quy định cách phối hợp giữa Developer và AI Agent, tuân thủ nghiêm ngặt yêu cầu không tự ý commit/push và quy tắc khai báo AI theo Course 9.

---

## 1. Nguyên tắc Git & Phân công vai trò

- **AI Agent**:
  - Đọc hiểu yêu cầu, viết mã nguồn, viết tests.
  - Tự động chạy lệnh kiểm thử: `pnpm lint`, `pnpm build`, `pnpm test:cov`.
  - **TUYỆT ĐỐI KHÔNG** chạy `git commit` hoặc `git push`.
  - Chuẩn bị sẵn thông điệp commit và báo cáo AI để Developer sử dụng.
- **Developer**:
  - Review code diff (`git diff`, `git status`).
  - Chạy thử nghiệm thực tế (Manual check).
  - Tự tay thực hiện `git commit` và `git push`.

---

## 2. Mẫu bàn giao của AI Agent sau mỗi Task

Khi Agent hoàn thành nhiệm vụ, Agent phải xuất định dạng sau trong phản hồi:

### 1. Đề xuất Commit Message (Conventional Commits)
```git
feat(backend): implement booking use-case with typeorm and slot lock
```

### 2. Mẫu khai báo AI cho Pull Request (Course 9 Attribution)
```markdown
### 1. Tổng quan thay đổi (Summary of Changes)
- [Mô tả ngắn gọn tính năng hoặc bug vừa thực hiện]

### 2. Khai báo mức độ sử dụng AI (AI Attribution - Course 9)
- **Các thành phần do AI sinh (AI-Generated)**:
  - Backend: [Ví dụ: Use case CreateBookingUseCase, TypeORM entity BookingOrmEntity]
  - Tests: [Ví dụ: Unit test create-booking.use-case.spec.ts đạt 75% coverage]
- **Các thành phần do Human tinh chỉnh / viết tay (Human-Crafted)**:
  - [Ví dụ: Kiểm tra logic concurrency lock trong PostgreSQL 16, review diff]

### 3. Phương thức kiểm chứng chất lượng (Verification Steps)
- [x] Linter: Pass `pnpm lint` (0 errors)
- [x] Build: Pass `pnpm build`
- [x] Unit Tests: `pnpm test:cov` đạt [XX]% coverage (>= 60%)
- [x] Developer Review: Đã review thủ công trước khi commit
```
