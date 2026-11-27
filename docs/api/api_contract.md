# TÀI LIỆU ĐẶC TẢ HỢP ĐỒNG API (API CONTRACT SPECIFICATION)
## DỰ ÁN: BOOKING APP (DEMO VERSION)
### Phiên bản tài liệu: Version 1.0.1 (v1.0.1)
### Tiêu chuẩn thiết kế: RESTful API & NestJS 12 Framework Standard

---

## 1. LỊCH SỬ THAY ĐỔI PHIÊN BẢN (REVISION HISTORY)

| Phiên bản (Version) | Ngày cập nhật | Người thực hiện | Tóm tắt các thay đổi so với phiên bản trước |
| :--- | :--- | :--- | :--- |
| **v1.0.1** | 2026-11-27 | System Architect / AI Agent | **Bản vá nhỏ (Minor Patch Release)**:<br>• Mở quyền Public cho 2 API tra cứu lịch hẹn: `GET /api/v1/schedules` (danh sách lịch) và `GET /api/v1/schedules/:id` (chi tiết lịch) nhằm phục vụ khách vãng lai và khách hàng xem trực tiếp lịch và số chỗ trống.<br>• Loại bỏ yêu cầu Bearer Token bắt buộc và mã lỗi 401/403 cho 2 endpoint trên. |
| **v1.0.0** | 2026-11-24 | System Architect / AI Agent | **Phiên bản khởi tạo đầu tiên (Initial Baseline Release)**:<br>• Thiết kế toàn bộ API Contract theo chuẩn RESTful cho Booking App.<br>• Ánh xạ toàn diện từ Đặc tả nghiệp vụ (Requirements Specification v1) và CSDL quan hệ (DBML Schema v1).<br>• Cung cấp đầy đủ 8 nhóm tài nguyên API với tiền tố định tuyến `/api/v1`: Xác thực (Auth), Quản lý người dùng (Users), Nhà cung cấp (Providers), Dịch vụ (Services), Lịch hẹn (Schedules), Đặt chỗ (Bookings), Báo cáo thống kê (Reports) và Giám sát hệ thống (Health).<br>• Quy chuẩn cấu trúc phản hồi lỗi thống nhất theo cơ chế NestJS Exception Filters (gồm `statusCode`, `message`, `error`, `timestamp`, `path`).<br>• Quy định tham chiếu toàn bộ Request/Response Body Objects tại phần Data Dictionary ở cuối tài liệu. |

---

## 2. QUY ƯỚC & NGUYÊN TẮC THIẾT KẾ CHUNG (GENERAL CONVENTIONS)

### 2.1. Cấu trúc đường dẫn (Base URL & Path Versioning)
- Toàn bộ các API trong phiên bản này đều mang tiền tố: `/api/v<x>/...`, trong đó `x` là số hiệu phiên bản cập nhật của API.
- Đối với Version 1 hiện tại: **Base Path = `/api/v1`**.
- Định dạng truyền tải dữ liệu mặc định: `application/json; charset=utf-8`.

### 2.2. Phân quyền truy cập (Role-Based Access Control - RBAC)
Hệ thống kiểm soát quyền truy cập dựa trên 4 mức phân quyền (tham chiếu BR-01):
1. **Public / Guest**: Khách vãng lai, người dùng chưa xác thực (không yêu cầu Bearer Token).
2. **Customer**: Khách hàng đã đăng nhập (`role = CUSTOMER`).
3. **Staff**: Nhân viên quản trị vận hành (`role = STAFF`).
4. **Admin**: Quản trị viên hệ thống tối cao duy nhất (`role = ADMIN`).

*Quy định Header xác thực*:
```http
Authorization: Bearer <access_token>
```

### 2.3. Quy chuẩn cấu trúc lỗi của NestJS (NestJS Error Response Format)
Hệ thống sử dụng cơ chế xử lý lỗi chuẩn hóa của **NestJS Exception Filter** (`HttpException`). Mọi phản hồi lỗi (HTTP Status $\ge$ 400) đều trả về đối tượng JSON đồng nhất, đại diện bởi schema `[ErrorMessageDto](#errormessagedto)` (hoặc `[ValidationErrorResponseDto](#validationerrorresponsedto)` khi validation thất bại).

**Chi tiết các thành phần trong phản hồi lỗi chuẩn NestJS:**
- `statusCode` (Number - Bắt buộc): Mã trạng thái HTTP tương ứng (ví dụ: `400`, `401`, `403`, `404`, `409`, `422`, `500`).
- `message` (String | Array of Strings - Bắt buộc):
  - Dạng chuỗi (`string`): Mô tả chi tiết nguyên nhân lỗi nghiệp vụ (ví dụ: `"Lịch hẹn đã hết chỗ trống"`).
  - Dạng mảng (`string[]`): Trả về danh sách chi tiết các vi phạm ràng buộc dữ liệu đầu vào khi kiểm tra bởi `ValidationPipe` (class-validator).
- `error` (String - Bắt buộc): Tên định danh ngắn gọn tiêu chuẩn của mã lỗi HTTP (ví dụ: `"Bad Request"`, `"Unauthorized"`, `"Forbidden"`, `"Not Found"`, `"Conflict"`, `"Unprocessable Entity"`, `"Internal Server Error"`).
- `timestamp` (String ISO-8601 - Tiêu chuẩn khuyến nghị NestJS): Thời điểm chính xác xảy ra lỗi trên server.
- `path` (String - Tiêu chuẩn khuyến nghị NestJS): Đường dẫn API endpoint phát sinh lỗi.

---

## 3. DANH MỤC CÁC ENDPOINT CHI TIẾT (API SPECIFICATIONS)

---

### PHÂN HỆ 1: XÁC THỰC & DANH TÍNH (AUTHENTICATION - `/api/v1/auth`)

#### 1.1. Đăng ký tài khoản Khách hàng mới (Register)
* **Mục đích**: Khách vãng lai đăng ký tài khoản Khách hàng mới (UC-01).
* **HTTP Method**: `POST`
* **Path**: `/api/v1/auth/register`
* **Quyền hạn (Permission)**: `Public` (Khách vãng lai)
* **Request Headers**: `Content-Type: application/json`
* **Request Body**: Tham chiếu `[RegisterRequestDto](#registerrequestdto)`
* **Success Response**:
  * **Code**: `201 Created`
  * **Mô tả**: Đăng ký tài khoản thành công, trả về thông tin người dùng vừa tạo (không bao gồm mật khẩu) kèm cặp JWT Access Token và Refresh Token để đăng nhập ngay.
  * **Response Body**: Tham chiếu `[RegisterResponseDto](#registerresponsedto)`
* **Error Responses**:
  * `400 Bad Request`: Dữ liệu đầu vào không hợp lệ (email sai định dạng, thiếu tên, mật khẩu không đủ độ dài) $\rightarrow$ Trả về `[ValidationErrorResponseDto](#validationerrorresponsedto)`
  * `409 Conflict`: Email đã tồn tại trong hệ thống $\rightarrow$ Trả về `[ErrorMessageDto](#errormessagedto)`
  * `500 Internal Server Error`: Lỗi máy chủ không xác định $\rightarrow$ Trả về `[ErrorMessageDto](#errormessagedto)`

---

#### 1.2. Đăng nhập hệ thống (Login)
* **Mục đích**: Người dùng (Admin, Staff, Customer) đăng nhập bằng email và mật khẩu để lấy JWT Token (UC-02).
* **HTTP Method**: `POST`
* **Path**: `/api/v1/auth/login`
* **Quyền hạn (Permission)**: `Public`
* **Request Headers**: `Content-Type: application/json`
* **Request Body**: Tham chiếu `[LoginRequestDto](#loginrequestdto)`
* **Success Response**:
  * **Code**: `200 OK`
  * **Mô tả**: Đăng nhập thành công, cấp phát cặp Access Token và Refresh Token cùng thông tin vai trò người dùng.
  * **Response Body**: Tham chiếu `[LoginResponseDto](#loginresponsedto)`
* **Error Responses**:
  * `400 Bad Request`: Định dạng email hoặc mật khẩu không hợp lệ $\rightarrow$ Trả về `[ValidationErrorResponseDto](#validationerrorresponsedto)`
  * `401 Unauthorized`: Sai thông tin email hoặc mật khẩu không khớp $\rightarrow$ Trả về `[ErrorMessageDto](#errormessagedto)`
  * `500 Internal Server Error`: Lỗi máy chủ không xác định $\rightarrow$ Trả về `[ErrorMessageDto](#errormessagedto)`

---

#### 1.3. Lấy thông tin tài khoản hiện tại (Get Current User Profile)
* **Mục đích**: Người dùng đang đăng nhập xem thông tin cá nhân của chính mình.
* **HTTP Method**: `GET`
* **Path**: `/api/v1/auth/me`
* **Quyền hạn (Permission)**: Đã xác thực (`Customer`, `Staff`, `Admin`)
* **Request Headers**: 
  * `Authorization: Bearer <access_token>`
* **Request Body**: Không có
* **Success Response**:
  * **Code**: `200 OK`
  * **Mô tả**: Trả về hồ sơ thông tin của tài khoản ứng với token đang đăng nhập.
  * **Response Body**: Tham chiếu `[UserProfileDto](#userprofiledto)`
* **Error Responses**:
  * `401 Unauthorized`: Token không hợp lệ, thiếu token hoặc token đã hết hạn $\rightarrow$ Trả về `[ErrorMessageDto](#errormessagedto)`
  * `404 Not Found`: Không tìm thấy dữ liệu người dùng trong cơ sở dữ liệu $\rightarrow$ Trả về `[ErrorMessageDto](#errormessagedto)`
  * `500 Internal Server Error`: Lỗi máy chủ không xác định $\rightarrow$ Trả về `[ErrorMessageDto](#errormessagedto)`

---

#### 1.4. Làm mới Access Token (Refresh Access Token)
* **Mục đích**: Cấp lại Access Token mới khi Access Token hiện tại hết hạn bằng cách sử dụng Refresh Token còn hiệu lực mà không bắt người dùng phải đăng nhập lại.
* **HTTP Method**: `POST`
* **Path**: `/api/v1/auth/refresh`
* **Quyền hạn (Permission)**: `Public` (Xác thực thông qua `refreshToken` trong Request Body)
* **Request Headers**: `Content-Type: application/json`
* **Request Body**: Tham chiếu `[RefreshTokenRequestDto](#refreshtokenrequestdto)`
* **Success Response**:
  * **Code**: `200 OK`
  * **Mô tả**: Làm mới thành công, trả về Access Token mới (kèm Refresh Token mới nếu áp dụng cơ chế token rotation).
  * **Response Body**: Tham chiếu `[RefreshTokenResponseDto](#refreshtokenresponsedto)`
* **Error Responses**:
  * `400 Bad Request`: Định dạng refresh token không hợp lệ hoặc thiếu dữ liệu $\rightarrow$ Trả về `[ValidationErrorResponseDto](#validationerrorresponsedto)`
  * `401 Unauthorized`: Refresh token không hợp lệ, sai chữ ký, đã hết hạn hoặc đã bị thu hồi $\rightarrow$ Trả về `[ErrorMessageDto](#errormessagedto)`
  * `500 Internal Server Error`: Lỗi máy chủ không xác định $\rightarrow$ Trả về `[ErrorMessageDto](#errormessagedto)`

---

### PHÂN HỆ 2: QUẢN LÝ TÀI KHOẢN NGƯỜI DÙNG (USERS - `/api/v1/users`)

#### 2.1. Xem danh sách tài khoản (List Users)
* **Mục đích**: Admin xem danh sách tài khoản, hỗ trợ tìm kiếm theo tên, email, lọc theo vai trò và phân trang (UC-03).
* **HTTP Method**: `GET`
* **Path**: `/api/v1/users`
* **Quyền hạn (Permission)**: `Admin` (Chỉ Admin duy nhất có quyền quản lý tài khoản)
* **Request Headers**: `Authorization: Bearer <access_token>`
* **Query Parameters**:
  * `page` (optional, integer, default: 1): Số trang hiện tại.
  * `limit` (optional, integer, default: 10): Số bản ghi trên mỗi trang.
  * `search` (optional, string): Từ khóa tìm kiếm theo họ tên hoặc email.
  * `role` (optional, enum: `CUSTOMER`, `STAFF`): Lọc theo vai trò tài khoản.
* **Request Body**: Không có
* **Success Response**:
  * **Code**: `200 OK`
  * **Mô tả**: Trả về danh sách tài khoản kèm siêu dữ liệu phân trang.
  * **Response Body**: Tham chiếu `[UserPaginationResponseDto](#userpaginationresponsedto)`
* **Error Responses**:
  * `401 Unauthorized`: Chưa đăng nhập hoặc token không hợp lệ $\rightarrow$ Trả về `[ErrorMessageDto](#errormessagedto)`
  * `403 Forbidden`: Người dùng không phải là Admin $\rightarrow$ Trả về `[ErrorMessageDto](#errormessagedto)`
  * `500 Internal Server Error`: Lỗi máy chủ không xác định $\rightarrow$ Trả về `[ErrorMessageDto](#errormessagedto)`

---

#### 2.2. Xem chi tiết tài khoản (Get User Details)
* **Mục đích**: Admin xem chi tiết thông tin của một tài khoản theo ID (UC-03).
* **HTTP Method**: `GET`
* **Path**: `/api/v1/users/:id`
* **Quyền hạn (Permission)**: `Admin`
* **Request Headers**: `Authorization: Bearer <access_token>`
* **URL Path Parameters**:
  * `id` (integer, required): ID tài khoản cần xem.
* **Request Body**: Không có
* **Success Response**:
  * **Code**: `200 OK`
  * **Mô tả**: Trả về thông tin chi tiết của người dùng.
  * **Response Body**: Tham chiếu `[UserDetailDto](#userdetaildto)`
* **Error Responses**:
  * `401 Unauthorized`: Chưa đăng nhập $\rightarrow$ Trả về `[ErrorMessageDto](#errormessagedto)`
  * `403 Forbidden`: Không có quyền truy cập $\rightarrow$ Trả về `[ErrorMessageDto](#errormessagedto)`
  * `404 Not Found`: Tài khoản không tồn tại $\rightarrow$ Trả về `[ErrorMessageDto](#errormessagedto)`
  * `500 Internal Server Error`: Lỗi máy chủ $\rightarrow$ Trả về `[ErrorMessageDto](#errormessagedto)`

---

#### 2.3. Tạo mới tài khoản (Create User)
* **Mục đích**: Admin tạo tài khoản Customer hoặc Staff mới (UC-03, BR-01).
* **HTTP Method**: `POST`
* **Path**: `/api/v1/users`
* **Quyền hạn (Permission)**: `Admin`
* **Request Headers**: 
  * `Authorization: Bearer <access_token>`
  * `Content-Type: application/json`
* **Request Body**: Tham chiếu `[CreateUserDto](#createuserdto)`
* **Success Response**:
  * **Code**: `201 Created`
  * **Mô tả**: Tạo tài khoản thành công.
  * **Response Body**: Tham chiếu `[UserDetailDto](#userdetaildto)`
* **Error Responses**:
  * `400 Bad Request`: Thông tin không hợp lệ hoặc vi phạm quy tắc BR-01 (cố tình truyền vai trò `role: ADMIN` vì hệ thống chỉ có 1 Admin duy nhất) $\rightarrow$ Trả về `[ErrorMessageDto](#errormessagedto)`
  * `401 Unauthorized`: Chưa đăng nhập $\rightarrow$ Trả về `[ErrorMessageDto](#errormessagedto)`
  * `403 Forbidden`: Không có quyền truy cập $\rightarrow$ Trả về `[ErrorMessageDto](#errormessagedto)`
  * `409 Conflict`: Email đã tồn tại trong hệ thống $\rightarrow$ Trả về `[ErrorMessageDto](#errormessagedto)`
  * `500 Internal Server Error`: Lỗi máy chủ $\rightarrow$ Trả về `[ErrorMessageDto](#errormessagedto)`

---

#### 2.4. Cập nhật thông tin tài khoản (Update User)
* **Mục đích**: Admin cập nhật họ tên, email hoặc thay đổi vai trò giữa Customer và Staff (UC-03, BR-01).
* **HTTP Method**: `PATCH`
* **Path**: `/api/v1/users/:id`
* **Quyền hạn (Permission)**: `Admin`
* **Request Headers**: 
  * `Authorization: Bearer <access_token>`
  * `Content-Type: application/json`
* **URL Path Parameters**:
  * `id` (integer, required): ID tài khoản cần chỉnh sửa.
* **Request Body**: Tham chiếu `[UpdateUserDto](#updateuserdto)`
* **Success Response**:
  * **Code**: `200 OK`
  * **Mô tả**: Cập nhật thông tin tài khoản thành công.
  * **Response Body**: Tham chiếu `[UserDetailDto](#userdetaildto)`
* **Error Responses**:
  * `400 Bad Request`: Dữ liệu gửi lên sai định dạng hoặc cố ý nâng quyền lên `ADMIN` (vi phạm BR-01) $\rightarrow$ Trả về `[ErrorMessageDto](#errormessagedto)`
  * `401 Unauthorized`: Chưa đăng nhập $\rightarrow$ Trả về `[ErrorMessageDto](#errormessagedto)`
  * `403 Forbidden`: Cố tình sửa đổi tài khoản của chính Admin $\rightarrow$ Trả về `[ErrorMessageDto](#errormessagedto)`
  * `404 Not Found`: Không tìm thấy tài khoản cần cập nhật $\rightarrow$ Trả về `[ErrorMessageDto](#errormessagedto)`
  * `409 Conflict`: Email mới bị trùng với người dùng khác $\rightarrow$ Trả về `[ErrorMessageDto](#errormessagedto)`
  * `500 Internal Server Error`: Lỗi máy chủ $\rightarrow$ Trả về `[ErrorMessageDto](#errormessagedto)`

---

#### 2.5. Đặt lại mật khẩu tài khoản (Reset Password)
* **Mục đích**: Admin đặt lại mật khẩu mới cho tài khoản Customer hoặc Staff (UC-03).
* **HTTP Method**: `PATCH`
* **Path**: `/api/v1/users/:id/reset-password`
* **Quyền hạn (Permission)**: `Admin`
* **Request Headers**: 
  * `Authorization: Bearer <access_token>`
  * `Content-Type: application/json`
* **URL Path Parameters**:
  * `id` (integer, required): ID người dùng cần đặt lại mật khẩu.
* **Request Body**: Tham chiếu `[ResetPasswordDto](#resetpassworddto)`
* **Success Response**:
  * **Code**: `200 OK`
  * **Mô tả**: Đặt lại mật khẩu thành công.
  * **Response Body**: Tham chiếu `[SuccessMessageResponseDto](#successmessageresponsedto)`
* **Error Responses**:
  * `400 Bad Request`: Mật khẩu mới không đáp ứng tiêu chuẩn bảo mật $\rightarrow$ Trả về `[ValidationErrorResponseDto](#validationerrorresponsedto)`
  * `401 Unauthorized`: Chưa đăng nhập $\rightarrow$ Trả về `[ErrorMessageDto](#errormessagedto)`
  * `403 Forbidden`: Không có quyền thao tác $\rightarrow$ Trả về `[ErrorMessageDto](#errormessagedto)`
  * `404 Not Found`: Không tìm thấy người dùng $\rightarrow$ Trả về `[ErrorMessageDto](#errormessagedto)`
  * `500 Internal Server Error`: Lỗi máy chủ $\rightarrow$ Trả về `[ErrorMessageDto](#errormessagedto)`

---

#### 2.6. Xóa tài khoản người dùng (Delete User)
* **Mục đích**: Admin xóa tài khoản người dùng (kèm cơ chế xóa cascade toàn bộ booking của tài khoản đó, BR-01, BR-04, UC-03).
* **HTTP Method**: `DELETE`
* **Path**: `/api/v1/users/:id`
* **Quyền hạn (Permission)**: `Admin`
* **Request Headers**: `Authorization: Bearer <access_token>`
* **URL Path Parameters**:
  * `id` (integer, required): ID tài khoản cần xóa.
* **Request Body**: Không có
* **Success Response**:
  * **Code**: `200 OK`
  * **Mô tả**: Xóa tài khoản thành công (đã tự động dọn dẹp các booking liên kết).
  * **Response Body**: Tham chiếu `[SuccessMessageResponseDto](#successmessageresponsedto)`
* **Error Responses**:
  * `400 Bad Request` / `403 Forbidden`: Cố tình xóa tài khoản Quản trị viên (Admin duy nhất - vi phạm nghiêm ngặt BR-01) $\rightarrow$ Trả về `[ErrorMessageDto](#errormessagedto)`
  * `401 Unauthorized`: Chưa đăng nhập $\rightarrow$ Trả về `[ErrorMessageDto](#errormessagedto)`
  * `404 Not Found`: Không tìm thấy tài khoản cần xóa $\rightarrow$ Trả về `[ErrorMessageDto](#errormessagedto)`
  * `500 Internal Server Error`: Lỗi máy chủ $\rightarrow$ Trả về `[ErrorMessageDto](#errormessagedto)`

---

### PHÂN HỆ 3: QUẢN LÝ NHÀ CUNG CẤP (PROVIDERS - `/api/v1/providers`)

#### 3.1. Xem danh sách nhà cung cấp (List Providers)
* **Mục đích**: Nhân viên quản trị xem danh sách nhà cung cấp phân trang, tìm kiếm theo tên (UC-05).
* **HTTP Method**: `GET`
* **Path**: `/api/v1/providers`
* **Quyền hạn (Permission)**: `Staff`, `Admin`
* **Request Headers**: `Authorization: Bearer <access_token>`
* **Query Parameters**:
  * `page` (optional, integer, default: 1): Số trang hiện tại.
  * `limit` (optional, integer, default: 10): Số bản ghi trên mỗi trang.
  * `search` (optional, string): Từ khóa tìm kiếm theo tên nhà cung cấp.
* **Request Body**: Không có
* **Success Response**:
  * **Code**: `200 OK`
  * **Mô tả**: Danh sách nhà cung cấp kèm phân trang.
  * **Response Body**: Tham chiếu `[ProviderPaginationResponseDto](#providerpaginationresponsedto)`
* **Error Responses**:
  * `401 Unauthorized`: Chưa đăng nhập $\rightarrow$ Trả về `[ErrorMessageDto](#errormessagedto)`
  * `403 Forbidden`: Không có quyền (Khách hàng không được truy cập danh mục quản trị nhà cung cấp) $\rightarrow$ Trả về `[ErrorMessageDto](#errormessagedto)`
  * `500 Internal Server Error`: Lỗi hệ thống $\rightarrow$ Trả về `[ErrorMessageDto](#errormessagedto)`

---

#### 3.2. Xem chi tiết nhà cung cấp (Get Provider Details)
* **Mục đích**: Xem chi tiết nhà cung cấp cùng danh sách các dịch vụ thuộc sở hữu (UC-05).
* **HTTP Method**: `GET`
* **Path**: `/api/v1/providers/:id`
* **Quyền hạn (Permission)**: `Staff`, `Admin`
* **Request Headers**: `Authorization: Bearer <access_token>`
* **URL Path Parameters**:
  * `id` (integer, required): ID nhà cung cấp.
* **Request Body**: Không có
* **Success Response**:
  * **Code**: `200 OK`
  * **Mô tả**: Trả về thông tin chi tiết nhà cung cấp và danh mục dịch vụ liên kết.
  * **Response Body**: Tham chiếu `[ProviderDetailDto](#providerdetaildto)`
* **Error Responses**:
  * `401 Unauthorized`: Chưa đăng nhập $\rightarrow$ Trả về `[ErrorMessageDto](#errormessagedto)`
  * `403 Forbidden`: Không có quyền truy cập $\rightarrow$ Trả về `[ErrorMessageDto](#errormessagedto)`
  * `404 Not Found`: Không tìm thấy nhà cung cấp $\rightarrow$ Trả về `[ErrorMessageDto](#errormessagedto)`
  * `500 Internal Server Error`: Lỗi hệ thống $\rightarrow$ Trả về `[ErrorMessageDto](#errormessagedto)`

---

#### 3.3. Thêm mới nhà cung cấp (Create Provider)
* **Mục đích**: Nhân viên tạo nhà cung cấp dịch vụ mới (UC-05).
* **HTTP Method**: `POST`
* **Path**: `/api/v1/providers`
* **Quyền hạn (Permission)**: `Staff`, `Admin`
* **Request Headers**: 
  * `Authorization: Bearer <access_token>`
  * `Content-Type: application/json`
* **Request Body**: Tham chiếu `[CreateProviderDto](#createproviderdto)`
* **Success Response**:
  * **Code**: `201 Created`
  * **Mô tả**: Tạo mới nhà cung cấp thành công.
  * **Response Body**: Tham chiếu `[ProviderDetailDto](#providerdetaildto)`
* **Error Responses**:
  * `400 Bad Request`: Dữ liệu đầu vào sai định dạng $\rightarrow$ Trả về `[ValidationErrorResponseDto](#validationerrorresponsedto)`
  * `401 Unauthorized`: Chưa đăng nhập $\rightarrow$ Trả về `[ErrorMessageDto](#errormessagedto)`
  * `403 Forbidden`: Không có quyền Staff/Admin $\rightarrow$ Trả về `[ErrorMessageDto](#errormessagedto)`
  * `409 Conflict`: Tên nhà cung cấp đã tồn tại trong cơ sở dữ liệu $\rightarrow$ Trả về `[ErrorMessageDto](#errormessagedto)`
  * `500 Internal Server Error`: Lỗi máy chủ $\rightarrow$ Trả về `[ErrorMessageDto](#errormessagedto)`

---

#### 3.4. Chỉnh sửa nhà cung cấp (Update Provider)
* **Mục đích**: Nhân viên cập nhật thông tin tên, mô tả của nhà cung cấp (UC-05).
* **HTTP Method**: `PATCH`
* **Path**: `/api/v1/providers/:id`
* **Quyền hạn (Permission)**: `Staff`, `Admin`
* **Request Headers**: 
  * `Authorization: Bearer <access_token>`
  * `Content-Type: application/json`
* **URL Path Parameters**:
  * `id` (integer, required): ID nhà cung cấp cần sửa.
* **Request Body**: Tham chiếu `[UpdateProviderDto](#updateproviderdto)`
* **Success Response**:
  * **Code**: `200 OK`
  * **Mô tả**: Cập nhật nhà cung cấp thành công.
  * **Response Body**: Tham chiếu `[ProviderDetailDto](#providerdetaildto)`
* **Error Responses**:
  * `400 Bad Request`: Thông tin không hợp lệ $\rightarrow$ Trả về `[ValidationErrorResponseDto](#validationerrorresponsedto)`
  * `401 Unauthorized`: Chưa xác thực $\rightarrow$ Trả về `[ErrorMessageDto](#errormessagedto)`
  * `403 Forbidden`: Không có quyền truy cập $\rightarrow$ Trả về `[ErrorMessageDto](#errormessagedto)`
  * `404 Not Found`: Không tìm thấy nhà cung cấp $\rightarrow$ Trả về `[ErrorMessageDto](#errormessagedto)`
  * `409 Conflict`: Tên nhà cung cấp bị trùng với bản ghi khác $\rightarrow$ Trả về `[ErrorMessageDto](#errormessagedto)`
  * `500 Internal Server Error`: Lỗi máy chủ $\rightarrow$ Trả về `[ErrorMessageDto](#errormessagedto)`

---

#### 3.5. Xóa nhà cung cấp (Delete Provider)
* **Mục đích**: Xóa nhà cung cấp (kèm cascade xóa các dịch vụ, lịch và booking liên quan theo BR-04, UC-05).
* **HTTP Method**: `DELETE`
* **Path**: `/api/v1/providers/:id`
* **Quyền hạn (Permission)**: `Staff`, `Admin`
* **Request Headers**: `Authorization: Bearer <access_token>`
* **URL Path Parameters**:
  * `id` (integer, required): ID nhà cung cấp cần xóa.
* **Request Body**: Không có
* **Success Response**:
  * **Code**: `200 OK`
  * **Mô tả**: Xóa nhà cung cấp và dữ liệu liên quan thành công.
  * **Response Body**: Tham chiếu `[SuccessMessageResponseDto](#successmessageresponsedto)`
* **Error Responses**:
  * `401 Unauthorized`: Chưa đăng nhập $\rightarrow$ Trả về `[ErrorMessageDto](#errormessagedto)`
  * `403 Forbidden`: Không có quyền thao tác $\rightarrow$ Trả về `[ErrorMessageDto](#errormessagedto)`
  * `404 Not Found`: Nhà cung cấp không tồn tại $\rightarrow$ Trả về `[ErrorMessageDto](#errormessagedto)`
  * `500 Internal Server Error`: Lỗi máy chủ $\rightarrow$ Trả về `[ErrorMessageDto](#errormessagedto)`

---

### PHÂN HỆ 4: QUẢN LÝ & DANH MỤC DỊCH VỤ (SERVICES - `/api/v1/services`)

#### 4.1. Xem & Tìm kiếm danh sách dịch vụ (List Services)
* **Mục đích**: Người dùng (Khách vãng lai, Khách hàng, Nhân viên) xem danh sách dịch vụ, tìm kiếm theo tên hoặc lọc theo nhà cung cấp (UC-04).
* **HTTP Method**: `GET`
* **Path**: `/api/v1/services`
* **Quyền hạn (Permission)**: `Public` (Không yêu cầu đăng nhập)
* **Request Headers**: Tùy chọn (Nếu có `Authorization` sẽ nhận diện user)
* **Query Parameters**:
  * `page` (optional, integer, default: 1): Trang hiện tại.
  * `limit` (optional, integer, default: 10): Số dịch vụ trên trang.
  * `search` (optional, string): Tìm kiếm theo tên dịch vụ.
  * `providerId` (optional, integer): Lọc theo nhà cung cấp cụ thể.
* **Request Body**: Không có
* **Success Response**:
  * **Code**: `200 OK`
  * **Mô tả**: Trả về danh sách dịch vụ kèm thông tin nhà cung cấp và phân trang.
  * **Response Body**: Tham chiếu `[ServicePaginationResponseDto](#servicepaginationresponsedto)`
* **Error Responses**:
  * `400 Bad Request`: Tham số truy vấn không hợp lệ $\rightarrow$ Trả về `[ValidationErrorResponseDto](#validationerrorresponsedto)`
  * `500 Internal Server Error`: Lỗi máy chủ $\rightarrow$ Trả về `[ErrorMessageDto](#errormessagedto)`

---

#### 4.2. Xem chi tiết dịch vụ (Get Service Details)
* **Mục đích**: Người dùng xem chi tiết dịch vụ, nhà cung cấp và danh sách các lịch hẹn còn trống sắp diễn ra (UC-04).
* **HTTP Method**: `GET`
* **Path**: `/api/v1/services/:id`
* **Quyền hạn (Permission)**: `Public`
* **URL Path Parameters**:
  * `id` (integer, required): ID dịch vụ cần xem.
* **Request Body**: Không có
* **Success Response**:
  * **Code**: `200 OK`
  * **Mô tả**: Thông tin dịch vụ, nhà cung cấp kèm danh sách lịch sắp tới có tính sẵn số chỗ còn trống (`availableSlots`).
  * **Response Body**: Tham chiếu `[ServiceDetailDto](#servicedetaildto)`
* **Error Responses**:
  * `404 Not Found`: Không tìm thấy dịch vụ $\rightarrow$ Trả về `[ErrorMessageDto](#errormessagedto)`
  * `500 Internal Server Error`: Lỗi máy chủ $\rightarrow$ Trả về `[ErrorMessageDto](#errormessagedto)`

---

#### 4.3. Tạo mới dịch vụ (Create Service)
* **Mục đích**: Nhân viên tạo dịch vụ mới thuộc một nhà cung cấp (UC-06).
* **HTTP Method**: `POST`
* **Path**: `/api/v1/services`
* **Quyền hạn (Permission)**: `Staff`, `Admin`
* **Request Headers**: 
  * `Authorization: Bearer <access_token>`
  * `Content-Type: application/json`
* **Request Body**: Tham chiếu `[CreateServiceDto](#createservicedto)`
* **Success Response**:
  * **Code**: `201 Created`
  * **Mô tả**: Tạo dịch vụ mới thành công.
  * **Response Body**: Tham chiếu `[ServiceDetailDto](#servicedetaildto)`
* **Error Responses**:
  * `400 Bad Request`: Thông tin không hợp lệ (giá < 0, thiếu tên) $\rightarrow$ Trả về `[ValidationErrorResponseDto](#validationerrorresponsedto)`
  * `401 Unauthorized`: Chưa đăng nhập $\rightarrow$ Trả về `[ErrorMessageDto](#errormessagedto)`
  * `403 Forbidden`: Không có quyền truy cập $\rightarrow$ Trả về `[ErrorMessageDto](#errormessagedto)`
  * `404 Not Found`: Nhà cung cấp liên kết không tồn tại trong hệ thống $\rightarrow$ Trả về `[ErrorMessageDto](#errormessagedto)`
  * `500 Internal Server Error`: Lỗi máy chủ $\rightarrow$ Trả về `[ErrorMessageDto](#errormessagedto)`

---

#### 4.4. Cập nhật dịch vụ (Update Service)
* **Mục đích**: Nhân viên cập nhật thông tin tên, mô tả, giá niêm yết hoặc nhà cung cấp của dịch vụ (UC-06).
* **HTTP Method**: `PATCH`
* **Path**: `/api/v1/services/:id`
* **Quyền hạn (Permission)**: `Staff`, `Admin`
* **Request Headers**: 
  * `Authorization: Bearer <access_token>`
  * `Content-Type: application/json`
* **URL Path Parameters**:
  * `id` (integer, required): ID dịch vụ cần cập nhật.
* **Request Body**: Tham chiếu `[UpdateServiceDto](#updateservicedto)`
* **Success Response**:
  * **Code**: `200 OK`
  * **Mô tả**: Cập nhật dịch vụ thành công.
  * **Response Body**: Tham chiếu `[ServiceDetailDto](#servicedetaildto)`
* **Error Responses**:
  * `400 Bad Request`: Dữ liệu gửi lên không hợp lệ $\rightarrow$ Trả về `[ValidationErrorResponseDto](#validationerrorresponsedto)`
  * `401 Unauthorized`: Chưa xác thực $\rightarrow$ Trả về `[ErrorMessageDto](#errormessagedto)`
  * `403 Forbidden`: Không có quyền thao tác $\rightarrow$ Trả về `[ErrorMessageDto](#errormessagedto)`
  * `404 Not Found`: Không tìm thấy dịch vụ hoặc nhà cung cấp mới $\rightarrow$ Trả về `[ErrorMessageDto](#errormessagedto)`
  * `500 Internal Server Error`: Lỗi máy chủ $\rightarrow$ Trả về `[ErrorMessageDto](#errormessagedto)`

---

#### 4.5. Xóa dịch vụ (Delete Service)
* **Mục đích**: Nhân viên xóa dịch vụ (kèm cascade xóa lịch và booking liên quan theo BR-04, UC-06).
* **HTTP Method**: `DELETE`
* **Path**: `/api/v1/services/:id`
* **Quyền hạn (Permission)**: `Staff`, `Admin`
* **Request Headers**: `Authorization: Bearer <access_token>`
* **URL Path Parameters**:
  * `id` (integer, required): ID dịch vụ cần xóa.
* **Request Body**: Không có
* **Success Response**:
  * **Code**: `200 OK`
  * **Mô tả**: Xóa dịch vụ thành công.
  * **Response Body**: Tham chiếu `[SuccessMessageResponseDto](#successmessageresponsedto)`
* **Error Responses**:
  * `401 Unauthorized`: Chưa đăng nhập $\rightarrow$ Trả về `[ErrorMessageDto](#errormessagedto)`
  * `403 Forbidden`: Không có quyền thao tác $\rightarrow$ Trả về `[ErrorMessageDto](#errormessagedto)`
  * `404 Not Found`: Không tìm thấy dịch vụ $\rightarrow$ Trả về `[ErrorMessageDto](#errormessagedto)`
  * `500 Internal Server Error`: Lỗi máy chủ $\rightarrow$ Trả về `[ErrorMessageDto](#errormessagedto)`

---

### PHÂN HỆ 5: QUẢN LÝ LỊCH HẸN & CHỖ TRỐNG (SCHEDULES - `/api/v1/schedules`)

#### 5.1. Xem danh sách lịch hẹn (List Schedules)
* **Mục đích**: Người dùng (Khách vãng lai, Khách hàng, Nhân viên, Admin) xem danh sách lịch, lọc theo dịch vụ, theo ngày, kiểm tra tổng số chỗ, số chỗ đã đặt và số chỗ còn trống (UC-04, UC-07, BR-02).
* **HTTP Method**: `GET`
* **Path**: `/api/v1/schedules`
* **Quyền hạn (Permission)**: `Public` (Khách vãng lai, Customer, Staff, Admin)
* **Request Headers**: Không bắt buộc (Nếu có: `Authorization: Bearer <access_token>`)
* **Query Parameters**:
  * `page` (optional, integer, default: 1): Trang hiện tại.
  * `limit` (optional, integer, default: 10): Số bản ghi trên trang.
  * `serviceId` (optional, integer): Lọc theo ID dịch vụ.
  * `date` (optional, string YYYY-MM-DD): Lọc theo ngày cụ thể.
  * `fromDate` (optional, string YYYY-MM-DD): Lọc từ ngày.
  * `toDate` (optional, string YYYY-MM-DD): Lọc đến ngày.
* **Request Body**: Không có
* **Success Response**:
  * **Code**: `200 OK`
  * **Mô tả**: Trả về danh sách lịch kèm thông tin chỗ còn trống và phân trang.
  * **Response Body**: Tham chiếu `[SchedulePaginationResponseDto](#schedulepaginationresponsedto)`
* **Error Responses**:
  * `500 Internal Server Error`: Lỗi hệ thống $\rightarrow$ Trả về `[ErrorMessageDto](#errormessagedto)`

---

#### 5.2. Xem chi tiết lịch hẹn (Get Schedule Details)
* **Mục đích**: Người dùng (Khách vãng lai, Khách hàng, Nhân viên, Admin) xem chi tiết một lịch hẹn cụ thể (UC-04, UC-07).
* **HTTP Method**: `GET`
* **Path**: `/api/v1/schedules/:id`
* **Quyền hạn (Permission)**: `Public` (Khách vãng lai, Customer, Staff, Admin)
* **Request Headers**: Không bắt buộc (Nếu có: `Authorization: Bearer <access_token>`)
* **URL Path Parameters**:
  * `id` (integer, required): ID lịch hẹn cần xem.
* **Request Body**: Không có
* **Success Response**:
  * **Code**: `200 OK`
  * **Mô tả**: Trả về chi tiết lịch, thời gian bắt đầu, thời lượng, tổng số chỗ, số chỗ đã đặt và số chỗ còn trống.
  * **Response Body**: Tham chiếu `[ScheduleDetailDto](#scheduledetaildto)`
* **Error Responses**:
  * `404 Not Found`: Không tìm thấy lịch $\rightarrow$ Trả về `[ErrorMessageDto](#errormessagedto)`
  * `500 Internal Server Error`: Lỗi máy chủ $\rightarrow$ Trả về `[ErrorMessageDto](#errormessagedto)`

---

#### 5.3. Tạo mới lịch hẹn (Create Schedule)
* **Mục đích**: Nhân viên tạo khung giờ lịch cho dịch vụ, kiểm tra ràng buộc không giao thoa khung giờ trong ngày (UC-07, BR-02, BR-05).
* **HTTP Method**: `POST`
* **Path**: `/api/v1/schedules`
* **Quyền hạn (Permission)**: `Staff`, `Admin`
* **Request Headers**: 
  * `Authorization: Bearer <access_token>`
  * `Content-Type: application/json`
* **Request Body**: Tham chiếu `[CreateScheduleDto](#createscheduledto)`
* **Success Response**:
  * **Code**: `201 Created`
  * **Mô tả**: Tạo lịch mới thành công.
  * **Response Body**: Tham chiếu `[ScheduleDetailDto](#scheduledetaildto)`
* **Error Responses**:
  * `400 Bad Request`: Thông tin không hợp lệ (số chỗ $\le$ 0, thời lượng $\le$ 0, ngày trong quá khứ) $\rightarrow$ Trả về `[ValidationErrorResponseDto](#validationerrorresponsedto)`
  * `401 Unauthorized`: Chưa đăng nhập $\rightarrow$ Trả về `[ErrorMessageDto](#errormessagedto)`
  * `403 Forbidden`: Không có quyền thao tác $\rightarrow$ Trả về `[ErrorMessageDto](#errormessagedto)`
  * `404 Not Found`: Dịch vụ liên kết không tồn tại $\rightarrow$ Trả về `[ErrorMessageDto](#errormessagedto)`
  * `409 Conflict`: Khung giờ bị trùng hoặc chồng lấn (overlap) với lịch khác của cùng dịch vụ trong ngày (vi phạm BR-05) $\rightarrow$ Trả về `[ErrorMessageDto](#errormessagedto)`
  * `500 Internal Server Error`: Lỗi máy chủ $\rightarrow$ Trả về `[ErrorMessageDto](#errormessagedto)`

---

#### 5.4. Chỉnh sửa lịch hẹn (Update Schedule)
* **Mục đích**: Nhân viên cập nhật khung giờ và tổng số chỗ tối đa (UC-07, BR-02, BR-05).
* **HTTP Method**: `PATCH`
* **Path**: `/api/v1/schedules/:id`
* **Quyền hạn (Permission)**: `Staff`, `Admin`
* **Request Headers**: 
  * `Authorization: Bearer <access_token>`
  * `Content-Type: application/json`
* **URL Path Parameters**:
  * `id` (integer, required): ID lịch hẹn cần sửa.
* **Request Body**: Tham chiếu `[UpdateScheduleDto](#updatescheduledto)`
* **Success Response**:
  * **Code**: `200 OK`
  * **Mô tả**: Cập nhật lịch thành công.
  * **Response Body**: Tham chiếu `[ScheduleDetailDto](#scheduledetaildto)`
* **Error Responses**:
  * `400 Bad Request`: Tổng số chỗ mới nhỏ hơn số chỗ đã đặt trước đó (`total_slots < booked_slots`) $\rightarrow$ Trả về `[ErrorMessageDto](#errormessagedto)`
  * `401 Unauthorized`: Chưa đăng nhập $\rightarrow$ Trả về `[ErrorMessageDto](#errormessagedto)`
  * `403 Forbidden`: Không có quyền thao tác $\rightarrow$ Trả về `[ErrorMessageDto](#errormessagedto)`
  * `404 Not Found`: Không tìm thấy lịch $\rightarrow$ Trả về `[ErrorMessageDto](#errormessagedto)`
  * `409 Conflict`: Khung giờ mới bị chồng lấn với lịch khác của dịch vụ trong ngày (BR-05) $\rightarrow$ Trả về `[ErrorMessageDto](#errormessagedto)`
  * `500 Internal Server Error`: Lỗi máy chủ $\rightarrow$ Trả về `[ErrorMessageDto](#errormessagedto)`

---

#### 5.5. Xóa lịch hẹn (Delete Schedule)
* **Mục đích**: Nhân viên xóa lịch (kèm cascade xóa các booking liên quan theo BR-04, UC-07).
* **HTTP Method**: `DELETE`
* **Path**: `/api/v1/schedules/:id`
* **Quyền hạn (Permission)**: `Staff`, `Admin`
* **Request Headers**: `Authorization: Bearer <access_token>`
* **URL Path Parameters**:
  * `id` (integer, required): ID lịch cần xóa.
* **Request Body**: Không có
* **Success Response**:
  * **Code**: `200 OK`
  * **Mô tả**: Xóa lịch và booking liên kết thành công.
  * **Response Body**: Tham chiếu `[SuccessMessageResponseDto](#successmessageresponsedto)`
* **Error Responses**:
  * `401 Unauthorized`: Chưa đăng nhập $\rightarrow$ Trả về `[ErrorMessageDto](#errormessagedto)`
  * `403 Forbidden`: Không có quyền thao tác $\rightarrow$ Trả về `[ErrorMessageDto](#errormessagedto)`
  * `404 Not Found`: Không tìm thấy lịch $\rightarrow$ Trả về `[ErrorMessageDto](#errormessagedto)`
  * `500 Internal Server Error`: Lỗi máy chủ $\rightarrow$ Trả về `[ErrorMessageDto](#errormessagedto)`

---

### PHÂN HỆ 6: QUẢN LÝ ĐẶT LỊCH & ĐẶT CHỖ (BOOKINGS - `/api/v1/bookings`)

#### 6.1. Đặt lịch dịch vụ mới (Create Booking)
* **Mục đích**: Khách hàng chọn lịch và số lượng chỗ cần đặt. Hệ thống kiểm tra chỗ trống, tạm giữ chỗ, snapshot đơn giá và tạo booking ở trạng thái `PENDING` (UC-08, BR-02).
* **HTTP Method**: `POST`
* **Path**: `/api/v1/bookings`
* **Quyền hạn (Permission)**: `Customer`
* **Request Headers**: 
  * `Authorization: Bearer <access_token>`
  * `Content-Type: application/json`
* **Request Body**: Tham chiếu `[CreateBookingDto](#createbookingdto)`
* **Success Response**:
  * **Code**: `201 Created`
  * **Mô tả**: Đặt lịch thành công, đã tạm giữ chỗ với trạng thái `PENDING`.
  * **Response Body**: Tham chiếu `[BookingDetailDto](#bookingdetaildto)`
* **Error Responses**:
  * `400 Bad Request`: Số lượng đặt không hợp lệ (nhỏ hơn 1) $\rightarrow$ Trả về `[ValidationErrorResponseDto](#validationerrorresponsedto)`
  * `401 Unauthorized`: Chưa đăng nhập $\rightarrow$ Trả về `[ErrorMessageDto](#errormessagedto)`
  * `403 Forbidden`: Người dùng không phải là Customer (Staff/Admin không thực hiện đặt dịch vụ với vai trò người mua) $\rightarrow$ Trả về `[ErrorMessageDto](#errormessagedto)`
  * `404 Not Found`: Không tìm thấy khung giờ lịch hẹn $\rightarrow$ Trả về `[ErrorMessageDto](#errormessagedto)`
  * `409 Conflict`: Số chỗ trống không đủ đáp ứng số lượng yêu cầu đặt chỗ (hết chỗ) $\rightarrow$ Trả về `[ErrorMessageDto](#errormessagedto)`
  * `500 Internal Server Error`: Lỗi máy chủ $\rightarrow$ Trả về `[ErrorMessageDto](#errormessagedto)`

---

#### 6.2. Xem lịch sử booking cá nhân (Get My Bookings)
* **Mục đích**: Khách hàng xem danh sách các booking do chính mình đặt (UC-09).
* **HTTP Method**: `GET`
* **Path**: `/api/v1/bookings/my-bookings`
* **Quyền hạn (Permission)**: `Customer`
* **Request Headers**: `Authorization: Bearer <access_token>`
* **Query Parameters**:
  * `page` (optional, integer, default: 1): Trang hiện tại.
  * `limit` (optional, integer, default: 10): Số bản ghi trên trang.
  * `status` (optional, enum: `PENDING`, `CONFIRMED`, `CANCELLED`, `REJECTED`): Lọc theo trạng thái booking.
* **Request Body**: Không có
* **Success Response**:
  * **Code**: `200 OK`
  * **Mô tả**: Danh sách booking cá nhân kèm phân trang.
  * **Response Body**: Tham chiếu `[BookingPaginationResponseDto](#bookingpaginationresponsedto)`
* **Error Responses**:
  * `401 Unauthorized`: Chưa đăng nhập $\rightarrow$ Trả về `[ErrorMessageDto](#errormessagedto)`
  * `500 Internal Server Error`: Lỗi máy chủ $\rightarrow$ Trả về `[ErrorMessageDto](#errormessagedto)`

---

#### 6.3. Quản lý toàn bộ booking hệ thống (List All Bookings - Staff/Admin)
* **Mục đích**: Nhân viên/Admin xem toàn bộ booking trong hệ thống, tìm kiếm, lọc theo ngày, dịch vụ, trạng thái (UC-09).
* **HTTP Method**: `GET`
* **Path**: `/api/v1/bookings`
* **Quyền hạn (Permission)**: `Staff`, `Admin`
* **Request Headers**: `Authorization: Bearer <access_token>`
* **Query Parameters**:
  * `page` (optional, integer, default: 1): Trang hiện tại.
  * `limit` (optional, integer, default: 10): Số bản ghi trên trang.
  * `status` (optional, enum: `PENDING`, `CONFIRMED`, `CANCELLED`, `REJECTED`): Lọc trạng thái.
  * `serviceId` (optional, integer): Lọc theo ID dịch vụ.
  * `customerId` (optional, integer): Lọc theo ID khách hàng.
  * `date` (optional, string YYYY-MM-DD): Lọc theo ngày diễn ra lịch hẹn.
* **Request Body**: Không có
* **Success Response**:
  * **Code**: `200 OK`
  * **Mô tả**: Danh sách booking toàn hệ thống kèm siêu dữ liệu phân trang.
  * **Response Body**: Tham chiếu `[BookingPaginationResponseDto](#bookingpaginationresponsedto)`
* **Error Responses**:
  * `401 Unauthorized`: Chưa xác thực $\rightarrow$ Trả về `[ErrorMessageDto](#errormessagedto)`
  * `403 Forbidden`: Không có quyền truy cập (Customer bị từ chối) $\rightarrow$ Trả về `[ErrorMessageDto](#errormessagedto)`
  * `500 Internal Server Error`: Lỗi máy chủ $\rightarrow$ Trả về `[ErrorMessageDto](#errormessagedto)`

---

#### 6.4. Xem chi tiết booking (Get Booking Details)
* **Mục đích**: Xem chi tiết một booking. Khách hàng chỉ xem được booking của mình; Nhân viên và Admin xem được bất kỳ booking nào (UC-09).
* **HTTP Method**: `GET`
* **Path**: `/api/v1/bookings/:id`
* **Quyền hạn (Permission)**: `Customer` (Chính chủ), `Staff`, `Admin`
* **Request Headers**: `Authorization: Bearer <access_token>`
* **URL Path Parameters**:
  * `id` (integer, required): ID bản ghi booking.
* **Request Body**: Không có
* **Success Response**:
  * **Code**: `200 OK`
  * **Mô tả**: Thông tin chi tiết booking, thông tin khách hàng, dịch vụ, lịch hẹn, trạng thái, snapshot giá, lý do và phí hủy (nếu có).
  * **Response Body**: Tham chiếu `[BookingDetailDto](#bookingdetaildto)`
* **Error Responses**:
  * `401 Unauthorized`: Chưa đăng nhập $\rightarrow$ Trả về `[ErrorMessageDto](#errormessagedto)`
  * `403 Forbidden`: Khách hàng cố tình xem booking của người khác (UC-09) $\rightarrow$ Trả về `[ErrorMessageDto](#errormessagedto)`
  * `404 Not Found`: Không tìm thấy mã booking $\rightarrow$ Trả về `[ErrorMessageDto](#errormessagedto)`
  * `500 Internal Server Error`: Lỗi máy chủ $\rightarrow$ Trả về `[ErrorMessageDto](#errormessagedto)`

---

#### 6.5. Xác nhận duyệt booking (Confirm Booking)
* **Mục đích**: Nhân viên xác nhận duyệt một booking đang ở trạng thái `PENDING`. Chuyển sang `CONFIRMED`, ghi nhận `confirmed_at` (UC-10, BR-02).
* **HTTP Method**: `PATCH`
* **Path**: `/api/v1/bookings/:id/confirm`
* **Quyền hạn (Permission)**: `Staff`, `Admin`
* **Request Headers**: 
  * `Authorization: Bearer <access_token>`
  * `Content-Type: application/json`
* **URL Path Parameters**:
  * `id` (integer, required): ID bản ghi booking cần duyệt.
* **Request Body**: Tham chiếu `[ConfirmBookingDto](#confirmbookingdto)` (Tùy chọn bổ sung ghi chú `side_note`)
* **Success Response**:
  * **Code**: `200 OK`
  * **Mô tả**: Booking được duyệt thành công sang trạng thái `CONFIRMED`.
  * **Response Body**: Tham chiếu `[BookingDetailDto](#bookingdetaildto)`
* **Error Responses**:
  * `400 Bad Request` / `409 Conflict`: Booking hiện tại không ở trạng thái `PENDING` (đã duyệt, đã hủy hoặc đã bị từ chối trước đó) $\rightarrow$ Trả về `[ErrorMessageDto](#errormessagedto)`
  * `401 Unauthorized`: Chưa đăng nhập $\rightarrow$ Trả về `[ErrorMessageDto](#errormessagedto)`
  * `403 Forbidden`: Người dùng không có quyền Staff/Admin $\rightarrow$ Trả về `[ErrorMessageDto](#errormessagedto)`
  * `404 Not Found`: Không tìm thấy booking $\rightarrow$ Trả về `[ErrorMessageDto](#errormessagedto)`
  * `500 Internal Server Error`: Lỗi máy chủ $\rightarrow$ Trả về `[ErrorMessageDto](#errormessagedto)`

---

#### 6.6. Từ chối booking (Reject Booking)
* **Mục đích**: Nhân viên từ chối booking đang `PENDING`. Chuyển sang `REJECTED`, lưu lý do từ chối vào `side_note`, ghi nhận `rejected_at`, và lập tức hoàn trả số chỗ trống cho lịch (UC-10, BR-02).
* **HTTP Method**: `PATCH`
* **Path**: `/api/v1/bookings/:id/reject`
* **Quyền hạn (Permission)**: `Staff`, `Admin`
* **Request Headers**: 
  * `Authorization: Bearer <access_token>`
  * `Content-Type: application/json`
* **URL Path Parameters**:
  * `id` (integer, required): ID bản ghi booking cần từ chối.
* **Request Body**: Tham chiếu `[RejectBookingDto](#rejectbookingdto)`
* **Success Response**:
  * **Code**: `200 OK`
  * **Mô tả**: Từ chối booking thành công, đã hoàn trả số chỗ trống về lịch.
  * **Response Body**: Tham chiếu `[BookingDetailDto](#bookingdetaildto)`
* **Error Responses**:
  * `400 Bad Request`: Thiếu lý do từ chối $\rightarrow$ Trả về `[ValidationErrorResponseDto](#validationerrorresponsedto)`
  * `401 Unauthorized`: Chưa đăng nhập $\rightarrow$ Trả về `[ErrorMessageDto](#errormessagedto)`
  * `403 Forbidden`: Không có quyền thao tác $\rightarrow$ Trả về `[ErrorMessageDto](#errormessagedto)`
  * `404 Not Found`: Không tìm thấy booking $\rightarrow$ Trả về `[ErrorMessageDto](#errormessagedto)`
  * `409 Conflict`: Booking không ở trạng thái `PENDING` $\rightarrow$ Trả về `[ErrorMessageDto](#errormessagedto)`
  * `500 Internal Server Error`: Lỗi máy chủ $\rightarrow$ Trả về `[ErrorMessageDto](#errormessagedto)`

---

#### 6.7. Hủy booking (Cancel Booking)
* **Mục đích**: Khách hàng hoặc Nhân viên hủy booking đang `PENDING` hoặc `CONFIRMED`. Hệ thống hoàn trả chỗ trống và tự động áp dụng chính sách tính phí hủy theo quy định (UC-11, BR-02, BR-03).
  * **Khách hàng hủy**:
    * Khi đang `PENDING`: Miễn phí hủy (`cancellation_fee = 0`).
    * Khi đã `CONFIRMED`: Tính phí hủy 10% trên tổng giá trị booking (`cancellation_fee = unit_price_snapshot * quantity * 0.10`).
    * Ghi nhận `cancelled_by_role = CUSTOMER`, `cancelled_by_id = user.id`.
  * **Nhân viên hủy**:
    * Miễn phí hủy cho khách hàng (`cancellation_fee = 0`).
    * Ghi nhận `cancelled_by_role = STAFF`, `cancelled_by_id = staff.id`.
* **HTTP Method**: `PATCH`
* **Path**: `/api/v1/bookings/:id/cancel`
* **Quyền hạn (Permission)**: `Customer` (Chính chủ booking), `Staff`, `Admin`
* **Request Headers**: 
  * `Authorization: Bearer <access_token>`
  * `Content-Type: application/json`
* **URL Path Parameters**:
  * `id` (integer, required): ID bản ghi booking cần hủy.
* **Request Body**: Tham chiếu `[CancelBookingDto](#cancelbookingdto)`
* **Success Response**:
  * **Code**: `200 OK`
  * **Mô tả**: Hủy booking thành công, trả về trạng thái `CANCELLED`, hoàn trả số chỗ và chi tiết mức phí hủy phát sinh.
  * **Response Body**: Tham chiếu `[BookingDetailDto](#bookingdetaildto)`
* **Error Responses**:
  * `400 Bad Request`: Thiếu lý do hủy $\rightarrow$ Trả về `[ValidationErrorResponseDto](#validationerrorresponsedto)`
  * `401 Unauthorized`: Chưa xác thực $\rightarrow$ Trả về `[ErrorMessageDto](#errormessagedto)`
  * `403 Forbidden`: Khách hàng cố tình hủy booking của người khác (UC-11) $\rightarrow$ Trả về `[ErrorMessageDto](#errormessagedto)`
  * `404 Not Found`: Không tìm thấy mã booking $\rightarrow$ Trả về `[ErrorMessageDto](#errormessagedto)`
  * `409 Conflict`: Booking ở trạng thái không được phép hủy (đã `CANCELLED` hoặc `REJECTED` trước đó) $\rightarrow$ Trả về `[ErrorMessageDto](#errormessagedto)`
  * `500 Internal Server Error`: Lỗi máy chủ $\rightarrow$ Trả về `[ErrorMessageDto](#errormessagedto)`

---

### PHÂN HỆ 7: BÁO CÁO & THỐNG KÊ (REPORTS - `/api/v1/reports`)

#### 7.1. Báo cáo thống kê booking theo trạng thái (Get Booking Status Statistics)
* **Mục đích**: Nhân viên xem tổng hợp số lượng và tỷ lệ phần trăm các booking theo từng trạng thái (`PENDING`, `CONFIRMED`, `CANCELLED`, `REJECTED`), có thể lọc theo khoảng ngày và dịch vụ (UC-12).
* **HTTP Method**: `GET`
* **Path**: `/api/v1/reports/bookings-by-status`
* **Quyền hạn (Permission)**: `Staff`, `Admin`
* **Request Headers**: `Authorization: Bearer <access_token>`
* **Query Parameters**:
  * `startDate` (optional, string YYYY-MM-DD): Ngày bắt đầu thống kê.
  * `endDate` (optional, string YYYY-MM-DD): Ngày kết thúc thống kê.
  * `serviceId` (optional, integer): Lọc theo một dịch vụ cụ thể.
* **Request Body**: Không có
* **Success Response**:
  * **Code**: `200 OK`
  * **Mô tả**: Báo cáo tổng hợp số lượng và tỷ lệ % phân bổ theo trạng thái.
  * **Response Body**: Tham chiếu `[ReportStatusResponseDto](#reportstatusresponsedto)`
* **Error Responses**:
  * `400 Bad Request`: Khoảng thời gian không hợp lệ (`startDate > endDate`) $\rightarrow$ Trả về `[ValidationErrorResponseDto](#validationerrorresponsedto)`
  * `401 Unauthorized`: Chưa đăng nhập $\rightarrow$ Trả về `[ErrorMessageDto](#errormessagedto)`
  * `403 Forbidden`: Không có quyền truy cập $\rightarrow$ Trả về `[ErrorMessageDto](#errormessagedto)`
  * `500 Internal Server Error`: Lỗi máy chủ $\rightarrow$ Trả về `[ErrorMessageDto](#errormessagedto)`

---

#### 7.2. Báo cáo doanh thu và booking theo tháng (Get Monthly Revenue Report)
* **Mục đích**: Nhân viên xem báo cáo số lượng booking và tổng doanh thu thực tế theo từng tháng trong năm đã chọn (UC-12).
  * **Quy tắc tính doanh thu tháng**:
    $$\text{Doanh thu thực tế} = \sum (\text{Booking CONFIRMED}) + \sum (\text{Phí hủy 10\% từ Booking do Customer hủy})$$
* **HTTP Method**: `GET`
* **Path**: `/api/v1/reports/monthly-revenue`
* **Quyền hạn (Permission)**: `Staff`, `Admin`
* **Request Headers**: `Authorization: Bearer <access_token>`
* **Query Parameters**:
  * `year` (required, integer, ví dụ: `2026`): Năm cần xem báo cáo doanh thu.
* **Request Body**: Không có
* **Success Response**:
  * **Code**: `200 OK`
  * **Mô tả**: Bảng thống kê chi tiết 12 tháng về số lượng booking và doanh thu thực tế.
  * **Response Body**: Tham chiếu `[ReportMonthlyRevenueResponseDto](#reportmonthlyrevenueresponsedto)`
* **Error Responses**:
  * `400 Bad Request`: Tham số `year` không hợp lệ hoặc thiếu $\rightarrow$ Trả về `[ValidationErrorResponseDto](#validationerrorresponsedto)`
  * `401 Unauthorized`: Chưa đăng nhập $\rightarrow$ Trả về `[ErrorMessageDto](#errormessagedto)`
  * `403 Forbidden`: Không có quyền truy cập $\rightarrow$ Trả về `[ErrorMessageDto](#errormessagedto)`
  * `500 Internal Server Error`: Lỗi máy chủ $\rightarrow$ Trả về `[ErrorMessageDto](#errormessagedto)`

---

### PHÂN HỆ 8: KIỂM TRA SỨC KHỎE HỆ THỐNG (HEALTH CHECK - `/api/v1/health`)

#### 8.1. Kiểm tra trạng thái máy chủ (Health Check)
* **Mục đích**: Kiểm tra tình trạng kết nối mạng, server NestJS và cơ sở dữ liệu PostgreSQL.
* **HTTP Method**: `GET`
* **Path**: `/api/v1/health`
* **Quyền hạn (Permission)**: `Public`
* **Request Headers**: Không yêu cầu
* **Request Body**: Không có
* **Success Response**:
  * **Code**: `200 OK`
  * **Mô tả**: Hệ thống và CSDL hoạt động bình thường.
  * **Response Body**: Tham chiếu `[HealthCheckResponseDto](#healthcheckresponsedto)`
* **Error Responses**:
  * `503 Service Unavailable`: CSDL PostgreSQL mất kết nối $\rightarrow$ Trả về `[ErrorMessageDto](#errormessagedto)`

---

## 4. DANH MỤC CÁC ĐỐI TƯỢNG DỮ LIỆU (DATA DICTIONARY & SCHEMA OBJECTS)

Phần này định nghĩa chi tiết cấu trúc kiểu dữ liệu của toàn bộ Request Body và Response Body được tham chiếu từ các API bên trên.

---

### 4.1. Nhóm đối tượng lỗi & thông báo dùng chung (Common & Error Objects)

#### ErrorMessageDto
Đối tượng phản hồi lỗi chuẩn tắc của **NestJS Exception Filter**.
```json
{
  "statusCode": 404,
  "message": "Không tìm thấy dịch vụ tương ứng với ID đã cung cấp",
  "error": "Not Found",
  "timestamp": "2026-11-24T16:00:00.000Z",
  "path": "/api/v1/services/999"
}
```
*Chi tiết các thuộc tính:*
- `statusCode` (integer): Mã trạng thái HTTP (400, 401, 403, 404, 409, 500,...).
- `message` (string): Chuỗi giải thích chi tiết lỗi nghiệp vụ.
- `error` (string): Tên tiêu chuẩn của mã lỗi HTTP (ví dụ `"Bad Request"`, `"Not Found"`, `"Conflict"`).
- `timestamp` (string, ISO 8601): Thời điểm server ghi nhận ngoại lệ.
- `path` (string): Endpoint URL phát sinh lỗi.

#### ValidationErrorResponseDto
Đối tượng phản hồi khi NestJS `ValidationPipe` (class-validator) phát hiện dữ liệu Request Body không hợp lệ.
```json
{
  "statusCode": 400,
  "message": [
    "email must be an email",
    "password must be longer than or equal to 6 characters"
  ],
  "error": "Bad Request",
  "timestamp": "2026-11-24T16:00:00.000Z",
  "path": "/api/v1/auth/register"
}
```
*Chi tiết các thuộc tính:*
- `statusCode` (integer): Giá trị cố định `400`.
- `message` (array of strings): Danh sách các điều kiện kiểm tra dữ liệu không đạt.
- `error` (string): Giá trị `"Bad Request"`.
- `timestamp` (string, ISO 8601): Thời điểm phát sinh lỗi.
- `path` (string): Endpoint nhận yêu cầu.

#### PaginationMetaDto
Siêu dữ liệu phân trang trả về kèm danh sách.
```json
{
  "total": 45,
  "page": 1,
  "limit": 10,
  "totalPages": 5,
  "hasNextPage": true,
  "hasPreviousPage": false
}
```
*Chi tiết các thuộc tính:*
- `total` (integer): Tổng số bản ghi thỏa mãn điều kiện.
- `page` (integer): Số thứ tự trang hiện tại.
- `limit` (integer): Số bản ghi trên mỗi trang.
- `totalPages` (integer): Tổng số trang.
- `hasNextPage` (boolean): Có trang tiếp theo hay không.
- `hasPreviousPage` (boolean): Có trang phía trước hay không.

#### SuccessMessageResponseDto
Thông báo thành công cho các thao tác không trả về thực thể (Reset mật khẩu, Xóa dữ liệu).
```json
{
  "success": true,
  "message": "Thao tác đã được thực hiện thành công"
}
```

#### HealthCheckResponseDto
```json
{
  "status": "ok",
  "timestamp": "2026-11-24T16:00:00.000Z",
  "database": "connected"
}
```

---

### 4.2. Nhóm đối tượng Xác thực (Authentication DTOs)

#### RegisterRequestDto
Dữ liệu gửi lên khi đăng ký tài khoản Khách hàng (UC-01).
```json
{
  "fullName": "Nguyễn Văn A",
  "email": "nguyenvana@example.com",
  "password": "Password123@"
}
```
*Ràng buộc dữ liệu (Validation Rules):*
- `fullName`: `string`, không rỗng, tối đa 100 ký tự.
- `email`: `string`, định dạng email chuẩn, tối đa 255 ký tự.
- `password`: `string`, độ dài tối thiểu 6 ký tự.

#### RegisterResponseDto
```json
{
  "user": {
    "id": 2,
    "fullName": "Nguyễn Văn A",
    "email": "nguyenvana@example.com",
    "role": "CUSTOMER",
    "createdAt": "2026-11-24T16:00:00.000Z"
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### LoginRequestDto
Dữ liệu gửi lên khi đăng nhập (UC-02).
```json
{
  "email": "admin@bookingapp.com",
  "password": "AdminSecurePassword123@"
}
```
*Ràng buộc dữ liệu:*
- `email`: `string`, email hợp lệ.
- `password`: `string`, không được để trống.

#### LoginResponseDto
```json
{
  "user": {
    "id": 1,
    "fullName": "Quản Trị Viên",
    "email": "admin@bookingapp.com",
    "role": "ADMIN"
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### RefreshTokenRequestDto
Dữ liệu gửi lên để yêu cầu cấp lại Access Token mới.
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```
*Ràng buộc dữ liệu:*
- `refreshToken`: `string`, không được để trống, chuỗi JWT Refresh Token hợp lệ.

#### RefreshTokenResponseDto
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```
*Chi tiết các thuộc tính:*
- `accessToken`: Chuỗi JWT Access Token mới được cấp với thời gian sống ngắn (ví dụ: 15 - 60 phút).
- `refreshToken`: Chuỗi JWT Refresh Token mới (áp dụng chiến lược Token Rotation an toàn nhằm vô hiệu hóa refresh token cũ) hoặc token hiện tại còn hiệu lực.

#### UserProfileDto
```json
{
  "id": 1,
  "fullName": "Quản Trị Viên",
  "email": "admin@bookingapp.com",
  "role": "ADMIN",
  "createdAt": "2026-11-20T08:00:00.000Z",
  "updatedAt": "2026-11-24T12:00:00.000Z"
}
```

---

### 4.3. Nhóm đối tượng Quản lý người dùng (Users DTOs)

#### CreateUserDto
Dữ liệu Admin dùng để tạo tài khoản Staff hoặc Customer mới (UC-03, BR-01).
```json
{
  "fullName": "Trần Thị Nhân Viên",
  "email": "staff1@bookingapp.com",
  "password": "StaffPassword123@",
  "role": "STAFF"
}
```
*Ràng buộc:*
- `fullName`: `string`, không rỗng, tối đa 100 ký tự.
- `email`: `string`, email hợp lệ, duy nhất.
- `password`: `string`, tối thiểu 6 ký tự.
- `role`: enum, giá trị cho phép: `"STAFF"` hoặc `"CUSTOMER"`. Tuyệt đối cấm `"ADMIN"`.

#### UpdateUserDto
Dữ liệu Admin dùng để chỉnh sửa tài khoản (UC-03, BR-01).
```json
{
  "fullName": "Trần Thị Nhân Viên Cập Nhật",
  "email": "staff_new@bookingapp.com",
  "role": "STAFF"
}
```
*Ràng buộc:*
- `fullName` (optional): `string`, tối đa 100 ký tự.
- `email` (optional): `string`, định dạng email.
- `role` (optional): enum `"STAFF"` hoặc `"CUSTOMER"`. Tuyệt đối cấm nâng quyền lên `"ADMIN"`.

#### ResetPasswordDto
Dữ liệu Admin đặt lại mật khẩu mới cho tài khoản (UC-03).
```json
{
  "newPassword": "NewSecurePassword456@"
}
```
*Ràng buộc:*
- `newPassword`: `string`, tối thiểu 6 ký tự.

#### UserDetailDto
```json
{
  "id": 3,
  "fullName": "Trần Thị Nhân Viên",
  "email": "staff1@bookingapp.com",
  "role": "STAFF",
  "createdAt": "2026-11-24T10:00:00.000Z",
  "updatedAt": "2026-11-24T10:00:00.000Z"
}
```

#### UserPaginationResponseDto
```json
{
  "data": [
    {
      "id": 1,
      "fullName": "Admin Hệ Thống",
      "email": "admin@bookingapp.com",
      "role": "ADMIN",
      "createdAt": "2026-11-01T00:00:00.000Z"
    },
    {
      "id": 2,
      "fullName": "Nguyễn Văn A",
      "email": "customer1@gmail.com",
      "role": "CUSTOMER",
      "createdAt": "2026-11-05T09:30:00.000Z"
    }
  ],
  "meta": {
    "total": 2,
    "page": 1,
    "limit": 10,
    "totalPages": 1,
    "hasNextPage": false,
    "hasPreviousPage": false
  }
}
```

---

### 4.4. Nhóm đối tượng Nhà cung cấp (Providers DTOs)

#### CreateProviderDto
Dữ liệu thêm mới nhà cung cấp (UC-05).
```json
{
  "name": "Trung Tâm Thể Thao Pegasus",
  "description": "Cung cấp hệ thống sân cầu lông và tennis chuẩn quốc tế."
}
```
*Ràng buộc:*
- `name`: `string`, không rỗng, tối đa 150 ký tự, là duy nhất.
- `description` (optional): `string`.

#### UpdateProviderDto
Dữ liệu cập nhật nhà cung cấp (UC-05).
```json
{
  "name": "Trung Tâm Thể Thao Pegasus Premium",
  "description": "Cung cấp hệ thống sân cầu lông chuẩn BWF và phòng gym cao cấp."
}
```
*Ràng buộc:*
- `name` (optional): `string`, tối đa 150 ký tự, không trùng lặp.
- `description` (optional): `string`.

#### ProviderDetailDto
```json
{
  "id": 1,
  "name": "Trung Tâm Thể Thao Pegasus",
  "description": "Cung cấp hệ thống sân cầu lông và tennis chuẩn quốc tế.",
  "createdAt": "2026-11-24T08:00:00.000Z",
  "updatedAt": "2026-11-24T08:00:00.000Z",
  "services": [
    {
      "id": 1,
      "name": "Thuê sân cầu lông VIP",
      "price": 150000.00
    }
  ]
}
```

#### ProviderPaginationResponseDto
```json
{
  "data": [
    {
      "id": 1,
      "name": "Trung Tâm Thể Thao Pegasus",
      "description": "Cung cấp hệ thống sân thể thao",
      "servicesCount": 3,
      "createdAt": "2026-11-24T08:00:00.000Z"
    }
  ],
  "meta": {
    "total": 1,
    "page": 1,
    "limit": 10,
    "totalPages": 1,
    "hasNextPage": false,
    "hasPreviousPage": false
  }
}
```

---

### 4.5. Nhóm đối tượng Dịch vụ (Services DTOs)

#### CreateServiceDto
Dữ liệu tạo dịch vụ mới (UC-06).
```json
{
  "providerId": 1,
  "name": "Thuê sân cầu lông VIP",
  "description": "Sân trải thảm đạt tiêu chuẩn thi đấu quốc tế, đầy đủ ánh sáng.",
  "price": 150000.00
}
```
*Ràng buộc:*
- `providerId`: `integer`, ID nhà cung cấp phải tồn tại.
- `name`: `string`, không rỗng, tối đa 150 ký tự.
- `description` (optional): `string`.
- `price`: `number`, $\ge 0$ (VNĐ).

#### UpdateServiceDto
Dữ liệu cập nhật dịch vụ (UC-06).
```json
{
  "providerId": 1,
  "name": "Thuê sân cầu lông VIP Sáng",
  "description": "Áp dụng khung giờ sáng với mức giá ưu đãi.",
  "price": 120000.00
}
```
*Ràng buộc:*
- `providerId` (optional): `integer`.
- `name` (optional): `string`, tối đa 150 ký tự.
- `description` (optional): `string`.
- `price` (optional): `number`, $\ge 0$.

#### ServiceDetailDto
```json
{
  "id": 1,
  "providerId": 1,
  "name": "Thuê sân cầu lông VIP",
  "description": "Sân trải thảm đạt tiêu chuẩn thi đấu quốc tế.",
  "price": 150000.00,
  "createdAt": "2026-11-24T08:30:00.000Z",
  "updatedAt": "2026-11-24T08:30:00.000Z",
  "provider": {
    "id": 1,
    "name": "Trung Tâm Thể Thao Pegasus"
  },
  "upcomingSchedules": [
    {
      "id": 1,
      "date": "2026-11-25",
      "startTime": "08:00:00",
      "duration": 2,
      "totalSlots": 4,
      "bookedSlots": 1,
      "availableSlots": 3
    }
  ]
}
```

#### ServicePaginationResponseDto
```json
{
  "data": [
    {
      "id": 1,
      "providerId": 1,
      "providerName": "Trung Tâm Thể Thao Pegasus",
      "name": "Thuê sân cầu lông VIP",
      "description": "Sân trải thảm đạt tiêu chuẩn thi đấu quốc tế.",
      "price": 150000.00,
      "createdAt": "2026-11-24T08:30:00.000Z"
    }
  ],
  "meta": {
    "total": 1,
    "page": 1,
    "limit": 10,
    "totalPages": 1,
    "hasNextPage": false,
    "hasPreviousPage": false
  }
}
```

---

### 4.6. Nhóm đối tượng Lịch hẹn & Chỗ trống (Schedules DTOs)

#### CreateScheduleDto
Dữ liệu tạo khung giờ lịch mới (UC-07, BR-02, BR-05).
```json
{
  "serviceId": 1,
  "date": "2026-11-25",
  "startTime": "08:00:00",
  "duration": 2,
  "totalSlots": 5
}
```
*Ràng buộc:*
- `serviceId`: `integer`, ID dịch vụ tồn tại.
- `date`: `string`, định dạng `YYYY-MM-DD`.
- `startTime`: `string`, định dạng `HH:mm:ss` hoặc `HH:mm`.
- `duration`: `integer`, thời lượng tính theo giờ ($> 0$).
- `totalSlots`: `integer`, tổng số chỗ tối đa ($> 0$).
- *Quy tắc nghiệp vụ BR-05*: Khung giờ `[startTime, startTime + duration]` không được giao thoa với bất kỳ lịch nào khác của cùng `serviceId` trong cùng `date`.

#### UpdateScheduleDto
Dữ liệu cập nhật lịch hẹn (UC-07, BR-02, BR-05).
```json
{
  "startTime": "08:30:00",
  "duration": 2,
  "totalSlots": 6
}
```
*Ràng buộc:*
- `startTime` (optional): `string` `HH:mm:ss`.
- `duration` (optional): `integer` $> 0$.
- `totalSlots` (optional): `integer` $> 0$, và bắt buộc phải $\ge$ `bookedSlots` hiện tại của lịch.
- *Quy tắc nghiệp vụ BR-05*: Khung giờ mới không được chồng lấn với lịch khác cùng ngày.

#### ScheduleDetailDto
```json
{
  "id": 1,
  "serviceId": 1,
  "serviceName": "Thuê sân cầu lông VIP",
  "date": "2026-11-25",
  "startTime": "08:00:00",
  "duration": 2,
  "totalSlots": 5,
  "bookedSlots": 2,
  "availableSlots": 3,
  "createdAt": "2026-11-24T09:00:00.000Z",
  "updatedAt": "2026-11-24T09:00:00.000Z"
}
```

#### SchedulePaginationResponseDto
```json
{
  "data": [
    {
      "id": 1,
      "serviceId": 1,
      "serviceName": "Thuê sân cầu lông VIP",
      "date": "2026-11-25",
      "startTime": "08:00:00",
      "duration": 2,
      "totalSlots": 5,
      "bookedSlots": 2,
      "availableSlots": 3
    }
  ],
  "meta": {
    "total": 1,
    "page": 1,
    "limit": 10,
    "totalPages": 1,
    "hasNextPage": false,
    "hasPreviousPage": false
  }
}
```

---

### 4.7. Nhóm đối tượng Đặt lịch & Booking (Bookings DTOs)

#### CreateBookingDto
Khách hàng gửi yêu cầu đặt lịch hẹn (UC-08, BR-02).
```json
{
  "scheduleId": 1,
  "quantity": 2
}
```
*Ràng buộc:*
- `scheduleId`: `integer`, ID lịch hẹn tồn tại.
- `quantity`: `integer`, số lượng chỗ cần đặt ($\ge 1$ và $\le$ số chỗ còn trống `availableSlots`).

#### ConfirmBookingDto
Nhân viên duyệt booking (UC-10).
```json
{
  "sideNote": "Đã kiểm tra chuyển khoản cọc, duyệt booking chính thức."
}
```
*Ràng buộc:*
- `sideNote` (optional): `string`, ghi chú thêm từ nhân viên.

#### RejectBookingDto
Nhân viên từ chối booking và giải thích lý do (UC-10).
```json
{
  "reason": "Khung giờ này sân đang bảo trì hệ thống đèn chiếu sáng đột xuất."
}
```
*Ràng buộc:*
- `reason`: `string`, không rỗng, mô tả lý do từ chối (được lưu vào `side_note`).

#### CancelBookingDto
Khách hàng hoặc nhân viên yêu cầu hủy booking (UC-11, BR-03).
```json
{
  "reason": "Khách hàng bận lịch công tác đột xuất."
}
```
*Ràng buộc:*
- `reason`: `string`, không rỗng, lý do hủy.

#### BookingDetailDto
Chi tiết bản ghi booking đầy đủ thông tin giao dịch, trạng thái và chính sách phí.
```json
{
  "id": 101,
  "customerId": 2,
  "customerName": "Nguyễn Văn A",
  "customerEmail": "customer1@gmail.com",
  "scheduleId": 1,
  "schedule": {
    "serviceId": 1,
    "serviceName": "Thuê sân cầu lông VIP",
    "providerName": "Trung Tâm Thể Thao Pegasus",
    "date": "2026-11-25",
    "startTime": "08:00:00",
    "duration": 2
  },
  "quantity": 2,
  "unitPriceSnapshot": 150000.00,
  "totalPrice": 300000.00,
  "status": "CONFIRMED",
  "sideNote": "Khách hàng ghi chú lấy sân số 2",
  "cancellationFee": 0.00,
  "cancelledById": null,
  "cancelledByRole": null,
  "confirmedAt": "2026-11-24T09:15:00.000Z",
  "cancelledAt": null,
  "rejectedAt": null,
  "createdAt": "2026-11-24T09:05:00.000Z",
  "updatedAt": "2026-11-24T09:15:00.000Z"
}
```
*Chi tiết các thuộc tính đặc biệt:*
- `unitPriceSnapshot` (number): Đơn giá dịch vụ được ghi nhận cố định tại thời điểm tạo booking.
- `totalPrice` (number): Tổng giá trị = `unitPriceSnapshot * quantity`.
- `status` (enum): `PENDING` | `CONFIRMED` | `CANCELLED` | `REJECTED`.
- `cancellationFee` (number): Phí hủy tính theo quy tắc BR-03 (nếu Khách hủy khi đã `CONFIRMED` thì bằng $10\%$ của `totalPrice`; ngược lại nếu Staff hủy hoặc Khách hủy khi `PENDING` thì bằng $0$).
- `cancelledByRole` (enum | null): `CUSTOMER` | `STAFF`.

#### BookingPaginationResponseDto
```json
{
  "data": [
    {
      "id": 101,
      "customerId": 2,
      "customerName": "Nguyễn Văn A",
      "serviceName": "Thuê sân cầu lông VIP",
      "date": "2026-11-25",
      "startTime": "08:00:00",
      "quantity": 2,
      "totalPrice": 300000.00,
      "status": "CONFIRMED",
      "createdAt": "2026-11-24T09:05:00.000Z"
    }
  ],
  "meta": {
    "total": 1,
    "page": 1,
    "limit": 10,
    "totalPages": 1,
    "hasNextPage": false,
    "hasPreviousPage": false
  }
}
```

---

### 4.8. Nhóm đối tượng Báo cáo & Thống kê (Reports DTOs)

#### ReportStatusResponseDto
Báo cáo phân bổ trạng thái booking (UC-12).
```json
{
  "filters": {
    "startDate": "2026-11-01",
    "endDate": "2026-11-30",
    "serviceId": null
  },
  "summary": {
    "totalBookings": 120,
    "byStatus": {
      "PENDING": {
        "count": 15,
        "percentage": 12.50
      },
      "CONFIRMED": {
        "count": 80,
        "percentage": 66.67
      },
      "CANCELLED": {
        "count": 15,
        "percentage": 12.50
      },
      "REJECTED": {
        "count": 10,
        "percentage": 8.33
      }
    }
  }
}
```

#### ReportMonthlyRevenueResponseDto
Báo cáo doanh thu thực tế theo từng tháng trong năm (UC-12, BR-03).
```json
{
  "year": 2026,
  "totalYearRevenue": 145200000.00,
  "totalYearBookings": 850,
  "months": [
    {
      "month": 1,
      "totalBookings": 70,
      "confirmedBookingsCount": 60,
      "customerCancelledBookingsCount": 5,
      "confirmedRevenue": 12000000.00,
      "cancellationFeeRevenue": 100000.00,
      "totalRevenue": 12100000.00
    },
    {
      "month": 2,
      "totalBookings": 65,
      "confirmedBookingsCount": 55,
      "customerCancelledBookingsCount": 6,
      "confirmedRevenue": 11000000.00,
      "cancellationFeeRevenue": 120000.00,
      "totalRevenue": 11120000.00
    }
  ]
}
```
*Ghi chú công thức:*
- `confirmedRevenue`: Tổng tiền từ các booking có trạng thái `CONFIRMED`.
- `cancellationFeeRevenue`: Tổng tiền phạt hủy ($10\%$) thu được từ các booking bị Khách hàng hủy sau khi đã xác nhận.
- `totalRevenue`: `confirmedRevenue + cancellationFeeRevenue`.
