# Quy trình Git & Khai báo AI (Course 9 Attribution Rules)

Tài liệu này quy định cách phối hợp giữa Developer và AI Agent, tuân thủ nghiêm ngặt yêu cầu không tự ý commit/push, bảo vệ các nhánh chính và quy tắc khai báo AI theo chuẩn Course 9.

---

## 1. Nguyên tắc Git & Phân công vai trò

- **AI Agent**:
  - Đọc hiểu yêu cầu, viết mã nguồn, viết tests.
  - Tự động chạy lệnh kiểm thử: `pnpm lint`, `pnpm build`, `pnpm test:cov`.
  - **TUYỆT ĐỐI KHÔNG** chạy `git commit` hoặc `git push`.
  - Chuẩn bị sẵn thông điệp commit chuẩn (Conventional Commits) và báo cáo khai báo AI cho Pull Request bằng cách tự động tạo file `.md` trong `docs/pull_requests/` để Developer sử dụng.
- **Developer**:
  - Review code diff (`git diff`, `git status`).
  - Chạy thử nghiệm thực tế (Manual check).
  - Tự tay thực hiện `git commit` và `git push`.

---

## 2. Ràng buộc an toàn khi tạo Mẫu khai báo Pull Request (Branch Guardrail)

Mỗi khi người dùng yêu cầu tạo mẫu khai báo Pull Request, AI Agent **bắt buộc phải tuân thủ thứ tự kiểm tra sau**:

1. **Kiểm tra tên nhánh hiện tại (Current Git Branch)**:
   - **Nếu branch hiện tại là `main`, `develop` hoặc một nhánh không phải nhánh của task (non-task branch)**:
     - **CẤM TUYỆT ĐỐI**: Không được tạo mẫu khai báo PR, không thực hiện bất kỳ hành động nào tiếp theo.
     - **BẮT BUỘC DỪNG LẠI & BÁO CÁO**: Thông báo rõ ràng cho Developer rằng đang đứng ở nhánh chính (`main`/`develop`), không phải nhánh task, nên không tạo Pull Request.
   - **Nếu branch hiện tại là nhánh task hợp lệ** (ví dụ: `docs/BE-7-...`, `feat/...`, `fix/...`, `refactor/...`):
     - Phân tích toàn bộ nội dung thay đổi (toàn bộ git diff giữa branch hiện tại và branch xuất phát `develop`/`main`).
     - Tự động tạo 1 file markdown (`.md`) chứa toàn bộ nội dung khai báo PR đặt trong thư mục `docs/pull_requests/` theo quy định tại Mục 2.1.
     - Hiển thị mẫu khai báo PR đầy đủ trong phản hồi kèm liên kết đường dẫn tương đối tới file vừa tạo.

### 2.1. Quy tắc lưu file khai báo PR trong `docs/pull_requests/`
- **Thư mục lưu trữ**: `docs/pull_requests/`
- **Định dạng file**: Markdown (`.md`)
- **Quy tắc đặt tên file**: Đặt theo định danh mã task hoặc tên nhánh làm việc:
  - Chuẩn theo task: `docs/pull_requests/<task-id>.md` (ví dụ: `docs/pull_requests/BE-7.md`, `docs/pull_requests/BE-12.md`).
  - Hoặc chuẩn theo nhánh: `docs/pull_requests/<branch-slug>.md` (ví dụ: `docs/pull_requests/BE-7-plan-overview.md`).
- **Nội dung file**: Chứa toàn bộ nội dung Mẫu khai báo Pull Request chuẩn (Tiêu đề Conventional Commits, Tổng quan thay đổi, Khai báo mức độ sử dụng AI, Phương thức kiểm chứng).

---

## 3. Cấu trúc Mẫu khai báo Pull Request chuẩn

**Nguyên tắc trình bày bắt buộc**: Mẫu khai báo PR phải viết **tổng quan, ngắn gọn, súc tích (high-level, concise)**; tập trung làm nổi bật mục tiêu chính, kiến trúc cốt lõi và các nhóm thay đổi chính. Tuyệt đối tránh liệt kê vụn vặt từng dòng/từng hàm hay viết diễn giải lê thê, dài dòng.

Mẫu khai báo Pull Request phải dựa trên **toàn bộ nội dung thay đổi trên branch hiện tại**, gồm các phần bắt buộc sau:

### 3.1. Tiêu đề Pull Request (PR Title)
Tuân thủ Conventional Commits kèm mã định danh task nếu có (chi tiết xem tại [docs/task_conventions.md](docs/task_conventions.md)):
```
<type>(<scope/task-id>): <mô tả ngắn gọn mục đích PR>
```
*Ví dụ*:
- `docs(BE-7): plan overview backend development roadmap`
- `feat(auth): implement jwt authentication and rbac guards`
- `fix(booking): resolve race condition in slot reservation`

### 3.2. Nội dung chi tiết Pull Request (Attribution Template)

```markdown
# Tiêu đề Pull Request (PR Title)
[Tiêu đề Conventional Commits]

---

## 1. Tổng quan thay đổi (Summary of Changes)
- [Liệt kê đầy đủ và ngắn gọn các tính năng, tài liệu, cấu trúc hoặc thay đổi đã thực hiện trên toàn bộ branch]
- [Chi tiết các file/module được thêm mới, cập nhật hoặc di chuyển]

## 2. Khai báo mức độ sử dụng AI (AI Attribution)

- Mã nguồn / Tài liệu: [Liệt kê cụ thể các file, module, use-case, entity hoặc tài liệu do AI đề xuất và sinh ra]
- Kiểm thử: [Các bộ unit tests, mock data do AI thiết lập kèm độ phủ % coverage]

## 3. Phương thức kiểm chứng chất lượng (Verification Steps)

- [Các chỉ dẫn nghiệp vụ, ràng buộc kiến trúc, review logic, kiểm tra bảo mật do Developer chỉ định và duyệt]
- [Đã review thủ công diff trước khi commit/merge]i
```
