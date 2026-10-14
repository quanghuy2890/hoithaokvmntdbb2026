# Cài chức năng nhập kết quả trên cPanel

## 1. Cấu hình cơ sở dữ liệu
1. Trong cPanel mở **MySQL® Databases**.
2. Tạo database và database user; gán user vào database với **ALL PRIVILEGES**.
3. Mở **phpMyAdmin**, chọn database vừa tạo, tab **Import**, nhập file `database.sql`.
4. Sao chép `config.example.php` thành `config.php` trên hosting và điền DB_HOST, DB_NAME, DB_USER, DB_PASS.

## 2. Đặt mật khẩu quản trị
Tạo chuỗi hash bằng PHP trên máy có PHP:
```php
<?php echo password_hash('MAT_KHAU_MOI_CUA_BAN', PASSWORD_DEFAULT);
```
Thay `PASTE_PASSWORD_HASH_HERE` trong `config.php` bằng chuỗi hash; đổi `ADMIN_USER` nếu muốn. Không dùng mật khẩu mẫu trong tài liệu.

## 3. Tải lên hosting
Tải các file/thư mục `admin/`, `api/`, `assets/matches.js`, `config.example.php`, `database.sql` và `INSTALL-HOSTING.md` vào `public_html`. Sau đó tạo `config.php` trên hosting từ mẫu. **Không đưa config.php chứa mật khẩu thật lên GitHub.**

Mở `https://TEN-MIEN/admin/login.php` để đăng nhập. Nếu chưa bật SSL, tạm dùng HTTP cho kiểm tra ban đầu; không nhập mật khẩu quản trị qua HTTP trên mạng công cộng. Khi AutoSSL cấp chứng chỉ, dùng HTTPS.

## 4. Cách hoạt động
- Trang quản trị lưu tỷ số trong MySQL, không ghi vào file JavaScript.
- `api/results.php` cung cấp kết quả công khai; chỉ tài khoản đăng nhập mới được ghi.
- Mã trận là khóa dựa trên môn và vị trí trong `assets/matches.js` (ví dụ `football-0`). Không đổi thứ tự/xóa trận trong file lịch sau khi đã nhập kết quả, nếu không khóa có thể trỏ sang trận khác.
- Trước khi dùng chính thức, hãy thử nhập một tỷ số mẫu rồi kiểm tra trang công khai.
