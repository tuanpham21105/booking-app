# ĐẶC TẢ YÊU CẦU NGHIỆP VỤ (REQUIREMENTS SPECIFICATION)
## DỰ ÁN: BOOKING APP (DEMO VERSION)

---

## 1. RÀNG BUỘC & QUY TẮC NGHIỆP VỤ (BUSINESS RULES)

### BR-01: Phân quyền & Tài khoản Admin duy nhất
* Hệ thống phân quyền thành 3 vai trò: **Quản trị viên (Admin)**, **Nhân viên (Staff)**, **Khách hàng (Customer)** và nhóm người dùng **Khách vãng lai (Guest)** chưa đăng nhập.
* Tài khoản Admin là duy nhất trong hệ thống, được tạo sẵn mặc định.
* Không cho phép tạo thêm tài khoản có vai trò Admin, không cho phép nâng quyền tài khoản khác lên Admin.
* Không cho phép xóa tài khoản Admin dưới bất kỳ hình thức nào.
* Admin có toàn quyền quản lý tài khoản của Customer và Staff.

### BR-02: Cơ chế Giữ chỗ & Quản lý chỗ trống
* Mỗi lịch gắn với một dịch vụ, một ngày và một khung giờ nhất định, có số chỗ tối đa (`totalSlots`).
* Số chỗ còn trống được tính bằng: Số chỗ tối đa trừ đi Số chỗ đã đặt.
* Khi Khách hàng gửi yêu cầu đặt lịch (trạng thái **Chờ xử lý - PENDING**): Hệ thống tạm thời giữ chỗ bằng cách cộng số lượng đặt vào số chỗ đã đặt, đảm bảo không xảy ra tình trạng đặt vượt quá số chỗ trống.
* Khi Nhân viên **Xác nhận (CONFIRMED)**: Chỗ đã giữ được chuyển thành trạng thái chính thức.
* Khi Nhân viên **Từ chối (REJECTED)** hoặc booking bị **Hủy (CANCELLED)**: Hệ thống tự động hoàn lại số chỗ trống tương ứng cho lịch đó.

### BR-03: Chính sách Hủy booking & Phí hủy
* Booking chỉ được phép hủy khi đang ở trạng thái **Chờ xử lý (PENDING)** hoặc **Đã xác nhận (CONFIRMED)**.
* **Khách hàng tự hủy**:
  * Hủy khi booking đang Chờ xử lý: **Miễn phí hủy**.
  * Hủy khi booking Đã xác nhận: **Tính phí hủy** (áp dụng mức phí cố định 10% trên tổng giá trị dịch vụ kể từ thời điểm booking được xác nhận).
  * Ghi nhận người thực hiện hủy là Khách hàng.
* **Nhân viên hủy**:
  * Nhân viên hủy booking: **Không tính phí hủy** cho khách hàng.
  * Ghi nhận người thực hiện hủy là Nhân viên.

### BR-04: Xóa dữ liệu liên kết (Cascade Deletion cho Demo)
Để hỗ trợ việc thao tác và dọn dẹp dữ liệu demo thuận tiện:
* **Xóa tài khoản**: Hệ thống cảnh báo và xóa toàn bộ các booking của tài khoản đó trước khi xóa tài khoản.
* **Xóa dịch vụ**: Hệ thống cảnh báo và xóa toàn bộ booking, xóa toàn bộ lịch liên quan trước khi xóa dịch vụ.
* **Xóa nhà cung cấp**: Kiểm tra dịch vụ liên kết; nếu có, cảnh báo và xóa các dịch vụ (kèm lịch và booking liên quan) trước khi xóa nhà cung cấp.
* **Xóa lịch**: Nếu lịch còn booking liên kết, cảnh báo và xóa các booking đó trước khi xóa lịch.

### BR-05: Trùng lịch dịch vụ
* Trong cùng một dịch vụ và trong cùng một ngày, không được phép tạo các lịch có khung giờ giao thoa (chồng lấn thời gian) với nhau.

---

## 2. DANH SÁCH CA SỬ DỤNG (USE CASE LIST)

| Mã UC | Tên Ca sử dụng | Tác nhân (Actor) | Mô tả tóm tắt |
| :--- | :--- | :--- | :--- |
| **UC-01** | Đăng ký tài khoản | Khách vãng lai (Guest) | Đăng ký tài khoản Khách hàng mới bằng tên, email, mật khẩu |
| **UC-02** | Đăng nhập hệ thống | 3 Vai trò (Admin, Staff, Customer) | Đăng nhập bằng email và mật khẩu |
| **UC-03** | Quản lý tài khoản | Admin | Xem danh sách, thêm, sửa, reset mật khẩu, xóa tài khoản Customer/Staff |
| **UC-04** | Xem, tìm kiếm dịch vụ | Mọi người (Không cần đăng nhập) | Xem danh sách dịch vụ, tìm kiếm theo tên, xem chi tiết và lịch còn trống |
| **UC-05** | Quản lý nhà cung cấp | Staff | Xem, tìm kiếm, thêm, sửa, xóa thông tin nhà cung cấp dịch vụ |
| **UC-06** | Quản lý dịch vụ | Staff | Thêm mới, chỉnh sửa thông tin, xóa dịch vụ |
| **UC-07** | Quản lý lịch & số chỗ trống | Staff | Xem, tạo khung giờ lịch, cập nhật số chỗ, xóa lịch theo dịch vụ |
| **UC-08** | Đặt lịch dịch vụ | Customer | Chọn dịch vụ, chọn lịch và số lượng chỗ cần đặt |
| **UC-09** | Xem lịch sử booking | Customer, Staff | Customer xem booking cá nhân; Staff xem tất cả booking hệ thống |
| **UC-10** | Xác nhận / Từ chối booking | Staff | Duyệt hoặc từ chối các booking đang chờ xử lý |
| **UC-11** | Hủy booking | Customer, Staff | Hủy booking đang chờ hoặc đã xác nhận, áp dụng tính phí hủy |
| **UC-12** | Báo cáo tổng quan booking | Staff | Thống kê số lượng booking theo trạng thái và theo tháng, tính doanh thu |

---

## 3. ĐẶC TẢ CHI TIẾT CA SỬ DỤNG (USE CASE SPECIFICATIONS)

### UC-01: Đăng ký tài khoản
* **Tác nhân**: Khách vãng lai (Guest)
* **Tiền điều kiện**: Người dùng chưa đăng nhập.
* **Luồng chính**:
  1. Người dùng nhập các thông tin đăng ký gồm: Họ và tên, Email, Mật khẩu.
  2. Hệ thống kiểm tra tính hợp lệ của thông tin và kiểm tra email chưa tồn tại trong hệ thống.
  3. Hệ thống tạo tài khoản mới với vai trò là Khách hàng (Customer).
  4. Hệ thống thông báo đăng ký thành công và hiển thị thông tin tài khoản vừa tạo (không bao gồm mật khẩu).
* **Luồng phụ / Ngoại lệ**:
  * Nếu thông tin không hợp lệ hoặc email đã tồn tại: Hệ thống hiển thị thông báo lỗi tương ứng và yêu cầu nhập lại.

---

### UC-02: Đăng nhập hệ thống
* **Tác nhân**: Admin, Staff, Customer
* **Tiền điều kiện**: Không có.
* **Luồng chính**:
  1. Người dùng nhập Email và Mật khẩu.
  2. Hệ thống kiểm tra tài khoản tồn tại và so khớp mật khẩu.
  3. Hệ thống xác thực thành công, cấp quyền truy cập và chuyển hướng người dùng theo đúng vai trò.
* **Luồng phụ / Ngoại lệ**:
  * Nếu email hoặc mật khẩu không đúng: Hệ thống thông báo lỗi đăng nhập không thành công.

---

### UC-03: Quản lý tài khoản
* **Tác nhân**: Quản trị viên (Admin)
* **Tiền điều kiện**: Đã đăng nhập với vai trò Admin.
* **Nghiệp vụ chi tiết**:
  * **Xem, tìm kiếm, lọc danh sách tài khoản**:
    * Admin lọc danh sách theo điều kiện (vai trò Customer hoặc Staff) hoặc tìm kiếm theo từ khóa (tên, email).
    * Hệ thống trả về danh sách tài khoản phân trang (không hiển thị mật khẩu).
  * **Xem chi tiết tài khoản**:
    * Admin chọn xem một tài khoản cụ thể theo mã định danh.
    * *Luồng chính*: Hệ thống hiển thị đầy đủ thông tin tài khoản.
    * *Ngoại lệ*: Nếu tài khoản không tồn tại, hệ thống thông báo lỗi không tìm thấy.
  * **Thêm tài khoản mới**:
    * Admin nhập tên, email, mật khẩu và chọn vai trò (Customer hoặc Staff).
    * *Luồng chính*: Hệ thống kiểm tra thông tin hợp lệ, email chưa tồn tại, tạo tài khoản mới và thông báo thành công.
    * *Ngoại lệ*: Nếu thông tin không hợp lệ, email bị trùng, hoặc cố tình chọn vai trò Admin, hệ thống từ chối tạo và thông báo lỗi.
  * **Chỉnh sửa tài khoản**:
    * Admin cập nhật thông tin tên, email hoặc vai trò (Customer/Staff) của tài khoản được chọn.
    * *Luồng chính*: Hệ thống kiểm tra email không trùng với người khác, cập nhật thông tin và thông báo thành công.
    * *Ngoại lệ*: Nếu tài khoản không tồn tại, dữ liệu không hợp lệ, email bị trùng, hoặc sửa tài khoản Admin, hệ thống từ chối cập nhật.
  * **Reset mật khẩu**:
    * Admin nhập mật khẩu mới cho tài khoản cần đổi.
    * *Luồng chính*: Hệ thống kiểm tra mật khẩu hợp lệ, cập nhật mật khẩu mới và thông báo thành công.
    * *Ngoại lệ*: Nếu tài khoản không tồn tại hoặc mật khẩu mới không hợp lệ, hệ thống báo lỗi.
  * **Xóa tài khoản**:
    * Admin yêu cầu xóa một tài khoản.
    * *Luồng chính*: Hệ thống đưa ra cảnh báo về việc xóa các booking liên kết của người dùng; sau khi xác nhận, hệ thống xóa các booking liên quan và xóa tài khoản.
    * *Ngoại lệ*:
      * Nếu tài khoản yêu cầu xóa là Admin: Hệ thống tuyệt đối từ chối và thông báo không được phép xóa tài khoản Admin.
      * Nếu tài khoản không tồn tại: Hệ thống thông báo lỗi không tìm thấy.

---

### UC-04: Xem, tìm kiếm, lọc dịch vụ
* **Tác nhân**: Mọi người dùng (Khách vãng lai, Customer, Staff, Admin)
* **Tiền điều kiện**: Không yêu cầu đăng nhập.
* **Nghiệp vụ chi tiết**:
  * **Xem và tìm kiếm danh sách dịch vụ**:
    * Người dùng xem danh sách dịch vụ, tìm kiếm theo tên dịch vụ hoặc lọc theo nhà cung cấp.
    * Hệ thống hiển thị danh sách dịch vụ phân trang kèm thông tin nhà cung cấp tương ứng.
  * **Xem chi tiết dịch vụ**:
    * Người dùng chọn một dịch vụ cụ thể.
    * *Luồng chính*: Hệ thống hiển thị chi tiết thông tin dịch vụ, nhà cung cấp và danh sách các lịch kèm số chỗ còn trống sắp diễn ra.
    * *Ngoại lệ*: Nếu dịch vụ không tồn tại, hệ thống báo lỗi không tìm thấy.

---

### UC-05: Quản lý nhà cung cấp
* **Tác nhân**: Nhân viên (Staff)
* **Tiền điều kiện**: Đã đăng nhập với vai trò Staff.
* **Nghiệp vụ chi tiết**:
  * **Xem danh sách nhà cung cấp**: Nhân viên xem danh sách phân trang, tìm kiếm theo tên, email hoặc số điện thoại.
  * **Xem chi tiết nhà cung cấp**: Nhân viên xem thông tin chi tiết của nhà cung cấp kèm danh sách các dịch vụ của nhà cung cấp đó. Ngoại lệ: Báo lỗi nếu nhà cung cấp không tồn tại.
  * **Thêm nhà cung cấp mới**: Nhân viên nhập tên, email, số điện thoại, địa chỉ. Hệ thống kiểm tra tên/email không trùng lặp và tạo mới. Ngoại lệ: Báo lỗi nếu thông tin không hợp lệ hoặc bị trùng lặp.
  * **Chỉnh sửa nhà cung cấp**: Nhân viên cập nhật thông tin nhà cung cấp. Hệ thống kiểm tra tính hợp lệ và lưu lại. Ngoại lệ: Báo lỗi nếu không tìm thấy hoặc trùng lặp thông tin với nhà cung cấp khác.
  * **Xóa nhà cung cấp**:
    * *Luồng chính*: Hệ thống kiểm tra nếu còn dịch vụ liên kết, đưa ra cảnh báo và xóa toàn bộ dịch vụ (kèm lịch và booking liên quan), sau đó xóa nhà cung cấp.
    * *Ngoại lệ*: Báo lỗi nếu nhà cung cấp không tồn tại.

---

### UC-06: Quản lý dịch vụ
* **Tác nhân**: Nhân viên (Staff)
* **Tiền điều kiện**: Đã đăng nhập với vai trò Staff.
* **Nghiệp vụ chi tiết**:
  * **Thêm dịch vụ mới**:
    * Nhân viên chọn nhà cung cấp và nhập thông tin dịch vụ (tên, mô tả, giá dịch vụ).
    * *Luồng chính*: Hệ thống kiểm tra nhà cung cấp tồn tại, thông tin dịch vụ hợp lệ và tạo dịch vụ mới.
    * *Ngoại lệ*: Báo lỗi nếu nhà cung cấp không tồn tại hoặc thông tin dịch vụ không hợp lệ.
  * **Chỉnh sửa dịch vụ**:
    * Nhân viên cập nhật thông tin dịch vụ và nhà cung cấp liên kết.
    * *Luồng chính*: Hệ thống kiểm tra thông tin hợp lệ và cập nhật dữ liệu dịch vụ.
    * *Ngoại lệ*: Báo lỗi nếu không tìm thấy dịch vụ/nhà cung cấp hoặc thông tin không hợp lệ.
  * **Xóa dịch vụ**:
    * *Luồng chính*: Hệ thống kiểm tra, cảnh báo còn booking và lịch liên kết; sau đó xóa toàn bộ booking của dịch vụ, xóa toàn bộ lịch của dịch vụ và xóa dịch vụ.
    * *Ngoại lệ*: Báo lỗi nếu dịch vụ không tồn tại.

---

### UC-07: Quản lý lịch & số chỗ trống
* **Tác nhân**: Nhân viên (Staff)
* **Tiền điều kiện**: Đã đăng nhập với vai trò Staff.
* **Nghiệp vụ chi tiết**:
  * **Xem danh sách lịch**: Nhân viên lọc lịch theo dịch vụ, theo ngày, xem số chỗ đã đặt và số chỗ còn trống.
  * **Xem chi tiết lịch**: Nhân viên xem chi tiết lịch theo mã định danh (dịch vụ, ngày, giờ bắt đầu/kết thúc, tổng số chỗ, chỗ đã đặt, chỗ còn trống). Ngoại lệ: Báo lỗi nếu không tìm thấy lịch.
  * **Thêm lịch mới**:
    * Nhân viên chọn dịch vụ, ngày, khung giờ (bắt đầu - kết thúc) và tổng số chỗ tối đa.
    * *Luồng chính*: Hệ thống kiểm tra dịch vụ tồn tại, thời gian hợp lệ, không bị trùng/chồng lấn khung giờ với lịch khác của cùng dịch vụ trong ngày, sau đó tạo lịch mới.
    * *Ngoại lệ*: Báo lỗi nếu dịch vụ không tồn tại, thông tin không hợp lệ hoặc bị trùng lịch.
  * **Chỉnh sửa lịch**:
    * Nhân viên cập nhật khung giờ và số chỗ tối đa của lịch.
    * *Luồng chính*: Hệ thống kiểm tra khung giờ không trùng lặp và số chỗ tối đa mới không được nhỏ hơn số chỗ đã đặt trước đó, sau đó cập nhật lịch.
    * *Ngoại lệ*: Báo lỗi nếu không tìm thấy lịch, bị trùng lịch, hoặc số chỗ mới nhỏ hơn số chỗ đã đặt.
  * **Xóa lịch**:
    * *Luồng chính*: Hệ thống cảnh báo còn booking liên kết, tiến hành xóa các booking liên quan và xóa lịch.
    * *Ngoại lệ*: Báo lỗi nếu lịch không tồn tại.

---

### UC-08: Đặt lịch dịch vụ
* **Tác nhân**: Khách hàng (Customer)
* **Tiền điều kiện**: Đã đăng nhập với vai trò Customer.
* **Luồng chính**:
  1. Khách hàng chọn dịch vụ, chọn lịch hẹn cụ thể và chọn số lượng chỗ cần đặt.
  2. Hệ thống kiểm tra dịch vụ và lịch có tồn tại, tính số chỗ còn trống của lịch.
  3. Hệ thống kiểm tra số chỗ còn trống có đủ đáp ứng số lượng khách yêu cầu hay không.
  4. Hệ thống tính tổng chi phí dịch vụ dựa trên số lượng đặt.
  5. Hệ thống tạm thời giữ chỗ (cộng dồn số lượng đặt vào số chỗ đã đặt của lịch) và tạo bản ghi booking ở trạng thái **Chờ xử lý (PENDING)**.
  6. Hệ thống hiển thị thông tin xác nhận đặt lịch thành công cùng chi phí tạm tính.
* **Luồng phụ / Ngoại lệ**:
  * Nếu dịch vụ hoặc lịch không tồn tại: Báo lỗi không tìm thấy.
  * Nếu số lượng đặt không hợp lệ hoặc vượt quá số chỗ trống còn lại: Hệ thống từ chối đặt và thông báo lịch đã hết chỗ hoặc không đủ số lượng yêu cầu.

---

### UC-09: Xem lịch sử booking
* **Tác nhân**: Customer, Staff
* **Tiền điều kiện**: Đã đăng nhập vào hệ thống.
* **Nghiệp vụ chi tiết**:
  * **Đối với Khách hàng (Customer)**:
    * *Xem danh sách*: Khách hàng chỉ xem được danh sách các booking do chính mình đặt, có thể lọc theo trạng thái booking.
    * *Xem chi tiết*: Khách hàng xem thông tin chi tiết một booking của mình. Nếu booking thuộc về người khác, hệ thống từ chối truy cập và báo lỗi không có quyền.
  * **Đối với Nhân viên (Staff)**:
    * *Xem danh sách*: Nhân viên xem được danh sách phân trang của tất cả booking trong hệ thống, có thể tìm kiếm và lọc theo trạng thái, ngày hoặc dịch vụ.
    * *Xem chi tiết*: Nhân viên có quyền xem chi tiết bất kỳ booking nào trong hệ thống kèm thông tin khách hàng, dịch vụ, lịch và thông tin người hủy (nếu có).
  * **Ngoại lệ chung**: Báo lỗi không tìm thấy nếu mã booking không tồn tại.

---

### UC-10: Xác nhận / Từ chối booking
* **Tác nhân**: Nhân viên (Staff)
* **Tiền điều kiện**: Đã đăng nhập với vai trò Staff.
* **Nghiệp vụ chi tiết**:
  * **Xác nhận booking (Confirm)**:
    * Nhân viên chọn xác nhận một booking đang ở trạng thái Chờ xử lý.
    * *Luồng chính*: Hệ thống kiểm tra booking đang ở trạng thái Chờ xử lý (`PENDING`), chuyển trạng thái booking sang **Đã xác nhận (CONFIRMED)**, ghi nhận thời điểm xác nhận và thông báo thành công.
    * *Ngoại lệ*: Báo lỗi nếu booking không tồn tại hoặc trạng thái booking hiện tại không phải là Chờ xử lý.
  * **Từ chối booking (Reject)**:
    * Nhân viên chọn từ chối một booking đang Chờ xử lý và nhập lý do từ chối.
    * *Luồng chính*: Hệ thống kiểm tra booking đang ở trạng thái `PENDING`, chuyển trạng thái sang **Đã từ chối (REJECTED)**, lưu lý do từ chối và lập tức hoàn lại số chỗ trống cho lịch tương ứng.
    * *Ngoại lệ*: Báo lỗi nếu booking không tồn tại hoặc trạng thái booking không phải là Chờ xử lý.

---

### UC-11: Hủy booking
* **Tác nhân**: Customer, Staff
* **Tiền điều kiện**: Đã đăng nhập vào hệ thống.
* **Nghiệp vụ chi tiết**:
  * **Khách hàng yêu cầu hủy**:
    * Khách hàng chọn booking cần hủy và nhập lý do hủy.
    * *Luồng chính*:
      1. Hệ thống kiểm tra booking phải thuộc sở hữu của khách hàng đó.
      2. Hệ thống kiểm tra trạng thái booking phải là Chờ xử lý (`PENDING`) hoặc Đã xác nhận (`CONFIRMED`).
      3. Nếu booking đang `PENDING`: Không tính phí hủy (phí hủy bằng 0).
      4. Nếu booking đã `CONFIRMED`: Tính phí hủy (10% tổng giá trị booking) tính từ thời điểm xác nhận.
      5. Hệ thống hoàn lại số chỗ trống cho lịch, chuyển trạng thái booking sang **Đã hủy (CANCELLED)**, ghi nhận người hủy là Khách hàng và thông báo chi tiết phí hủy.
    * *Ngoại lệ*:
      * Nếu booking không thuộc sở hữu của khách hàng: Hệ thống từ chối và báo lỗi không có quyền.
      * Nếu booking đang ở trạng thái khác (đã bị từ chối hoặc đã bị hủy trước đó): Báo lỗi trạng thái không hợp lệ để hủy.
  * **Nhân viên yêu cầu hủy**:
    * Nhân viên chọn booking cần hủy và nhập lý do hủy vận hành.
    * *Luồng chính*:
      1. Hệ thống kiểm tra trạng thái booking phải là `PENDING` hoặc `CONFIRMED`.
      2. Hệ thống không tính phí hủy đối với khách hàng (phí hủy bằng 0).
      3. Hệ thống hoàn lại số chỗ trống cho lịch, chuyển trạng thái booking sang **Đã hủy (CANCELLED)**, ghi nhận người hủy là Nhân viên.
    * *Ngoại lệ*: Báo lỗi nếu booking không tồn tại hoặc trạng thái không hợp lệ để hủy.

---

### UC-12: Báo cáo tổng quan booking
* **Tác nhân**: Nhân viên (Staff)
* **Tiền điều kiện**: Đã đăng nhập với vai trò Staff.
* **Nghiệp vụ chi tiết**:
  * **Báo cáo theo trạng thái booking**:
    * Nhân viên gửi điều kiện lọc theo khoảng thời gian và dịch vụ.
    * Hệ thống tổng hợp và trả về thống kê số lượng cùng tỷ lệ phần trăm theo từng trạng thái: Chờ xử lý, Đã xác nhận, Đã hủy, Đã từ chối.
  * **Báo cáo theo tháng và Doanh thu**:
    * Nhân viên chọn năm cần xem báo cáo.
    * Hệ thống thống kê số lượng booking phát sinh và tổng doanh thu thực tế theo từng tháng trong năm.
    * *Quy tắc tính doanh thu tháng*: Doanh thu được tính bằng Tổng tiền của các booking Đã xác nhận (`CONFIRMED`) cộng với Phí phạt hủy thu được từ các booking bị Khách hàng hủy (`CANCELLED`).
