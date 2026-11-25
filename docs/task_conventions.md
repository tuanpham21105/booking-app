# Quy ước Task, Issue và Git Naming (Task & Git Conventions)

Tài liệu này quy định chuẩn đặt tên Task, viết Issue, đặt tên Nhánh (Branch), Thông điệp Commit và Tiêu đề Pull Request (PR) cho toàn bộ dự án **Booking App**.

---

## 1. Quy ước Đặt tên Task (Task ID)

Mỗi task trong dự án được gán một định danh duy nhất theo cú pháp:

```
<Loại>-<STT>
```

### 1.1. Phân loại Task (`<Loại>`)
- **`FE`**: Frontend (Giao diện người dùng, components, state, hooks, styling)
- **`BE`**: Backend (API, domain logic, service, controller, database, migrations)
- **`OPS`**: DevOps / Hạ tầng (Docker, Docker Compose, CI/CD, deployment, server config)
- **`DOCS`**: Tài liệu dự án (Đặc tả yêu cầu, kế hoạch, hướng dẫn, conventions)
- **`QA`**: Kiểm thử & Đảm bảo chất lượng (Test plan, automation test, test cases tổng hợp)

### 1.2. Số thứ tự (`<STT>`)
- Là **số thứ tự của Issue** gắn liền trực tiếp với task đó trên hệ thống quản lý mã nguồn (GitHub / GitLab Issue number).
- Ví dụ:
  - `BE-7`: Task Backend tương ứng với Issue #7.
  - `BE-12`: Task Backend tương ứng với Issue #12.
  - `FE-3`: Task Frontend tương ứng với Issue #3.
  - `DOCS-1`: Task tài liệu tương ứng với Issue #1.
  - `OPS-2`: Task hạ tầng tương ứng với Issue #2.
  - `QA-4`: Task kiểm thử tương ứng với Issue #4.

---

## 2. Quy ước Viết Issue (Issue Template)

Mọi Issue khởi tạo trên GitHub / GitLab cần tuân theo cấu trúc chuẩn:

### 2.1. Tiêu đề Issue (Title)
```
[<Loại đầy đủ>] <Mục tiêu sơ bộ>
```
- `<Loại đầy đủ>`: Tên phân loại ghi rõ nghĩa, bao gồm: `[Backend]`, `[Frontend]`, `[Documents]`, `[DevOps]`, `[QA]`.
- `<Mục tiêu sơ bộ>`: Tóm tắt ngắn gọn mục tiêu công việc cần giải quyết.

*Ví dụ:*
- `[Backend] Lên kế hoạch phát triển tổng quan Backend`
- `[Backend] Thêm class-validator, validation pipe và global exception filter`
- `[Frontend] Xây dựng trang Đăng nhập và Đăng ký`
- `[Documents] Thiết lập tài liệu quy ước đặt tên task và issue`

### 2.2. Nội dung Issue (Body)
Gồm 2 phần bắt buộc:
```markdown
## Mô tả

[Mô tả chi tiết bối cảnh, lý do, yêu cầu nghiệp vụ và phạm vi công việc cần thực hiện]

## Kết quả

- [Mô tả tiêu chí nghiệm thu cụ thể: các file cần tạo/chỉnh sửa, API endpoint hoạt động, test coverage, v.v.]
```

---

## 3. Quy ước Đặt tên Nhánh (Branch Naming)

Tên nhánh làm việc được tạo dựa trên mã task:
```
<type>/<Task-ID>-<mô-tả-ngắn>
```
- `<type>`: `feat`, `fix`, `docs`, `refactor`, `chore`, `test`, `ci`.
- `<Task-ID>`: Khớp chính xác với mã task (`<Loại>-<STT>`).
- `<mô-tả-ngắn>`: Dạng kebab-case (chữ thường, nối bằng dấu gạch ngang `-`).

*Ví dụ:*
- `feat/BE-12-common-infrastructure-base-and-health-check-endpoint`
- `docs/BE-7-plan-overview`
- `feat/FE-3-auth-pages`
- `chore/OPS-2-docker-compose-config`
- `fix/FE-5-token-refresh`

---

## 4. Quy ước Đặt thông điệp Commit (Commit Message)

Sử dụng chuẩn Conventional Commits kết hợp mã task:
```
<type>(<Task-ID>): <mô tả ngắn về thay đổi>
```
- `<type>`: `feat`, `fix`, `docs`, `refactor`, `style`, `test`, `chore`.
- `(<Task-ID>)`: Mã task đặt trong dấu ngoặc tròn.

*Ví dụ:*
- `feat(BE-12): add class validator package, validation pipe activate, add global exception filter`
- `feat(BE-12): implement health check module and endpoint with unit and e2e tests`
- `docs(BE-7): plan overview backend development roadmap`
- `fix(FE-5): handle expired access token gracefully`

---

## 5. Quy ước Đặt tên Pull Request (PR Title) & Mẫu khai báo

### 5.1. Tiêu đề Pull Request
Khớp chuẩn Conventional Commits và mã task:
```
<type>(<Task-ID>): <mô tả ngắn gọn mục đích PR>
```
*Ví dụ:*
- `feat(BE-12): add common infrastructure base and health check endpoint`
- `docs(BE-7): plan overview backend development roadmap`

### 5.2. Mẫu khai báo Pull Request
- Khi chuẩn bị PR, AI Agent sẽ tự động tạo file khai báo tại:
  `docs/pull_requests/<Task-ID>.md` (ví dụ: `docs/pull_requests/BE-12.md`).
- Nội dung file bao gồm: Tiêu đề PR, Tổng quan thay đổi, Khai báo mức độ sử dụng AI (Attribution) và Phương thức kiểm chứng chất lượng theo quy định tại [.agents/context/01-workflow-and-ai-rules.md](.agents/context/01-workflow-and-ai-rules.md).
