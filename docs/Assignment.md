# Assignment – Tuần 3–4: Booking App (Frontend + Backend)

> Làm cá nhân hoặc cặp 2 người; mở rộng từ repo mẫu Booking App trong 2 tuần training. Dữ liệu giả lập.

## YÊU CẦU

1. Khách hàng (CUSTOMER): xem, tìm kiếm, lọc dịch vụ; đặt lịch/đặt chỗ; xem lịch sử booking của mình
2. Nhân viên (STAFF): quản lý dịch vụ, nhà cung cấp, lịch/số chỗ còn trống; xử lý booking (xác nhận / từ chối / hủy)
3. Đăng ký, đăng nhập (JWT), phân quyền CUSTOMER / STAFF / ADMIN
4. Backend: NestJS + PostgreSQL/Prisma, có migration và dữ liệu seed; validation, xử lý lỗi thống nhất, Swagger
5. Frontend: React + TypeScript, gồm trang cho khách hàng (danh sách, chi tiết, đặt chỗ, lịch sử) và trang quản trị cho nhân viên; gọi API backend có xác thực JWT
6. Không cho đặt vượt số chỗ; hủy booking theo chính sách (phí hủy); báo cáo đơn giản cho nhân viên (số booking theo trạng thái, theo tháng)
7. Unit test bằng Jest cho backend, độ phủ test service ≥ 60%
8. Chạy được toàn bộ ứng dụng (frontend + backend + DB) bằng docker-compose (nên có)
9. README hướng dẫn chạy local; làm việc qua Pull Request có review của mentor
10. Được dùng AI coding tool theo quy tắc của course 9; mô tả PR ghi rõ phần nào do AI sinh và đã kiểm tra thế nà
