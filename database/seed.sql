-- =============================================================
-- Clinic Management System — synthetic fixture data for LOCAL DEV ONLY.
-- Never applied to AWS/production — that database already has its own real
-- data, seeded separately (see database/migrations/ history in git log for
-- how it got there before this consolidation).
-- Password hash: bcrypt của "Password@123"
--
-- Deliberately has no `USE <db>` statement — both real invocation paths
-- already select the target database themselves (docker-entrypoint-initdb.d
-- via MYSQL_DATABASE, `npm run db:seed` via the `mysql ... clinic <` CLI
-- arg), so hardcoding one here would silently redirect anyone testing this
-- file against a differently-named database back to `clinic`.
-- =============================================================

SET NAMES utf8mb4;

SET FOREIGN_KEY_CHECKS = 0;

-- =============================================================
-- app_messages (seed trước, không có FK)
-- Mỗi message_code có 2 bản dịch: vi (mặc định) và en
-- =============================================================
INSERT INTO app_messages (id, message_code, locale, message) VALUES
-- INFO
('am000001-0000-0000-0000-000000000001', 'MSG_INFO_0001', 'vi', 'Đăng nhập thành công.'),
('am000001-0000-0000-0000-000000000002', 'MSG_INFO_0002', 'vi', 'Lịch hẹn đã được xác nhận.'),
('am000001-0000-0000-0000-000000000004', 'MSG_INFO_0004', 'vi', 'Đặt lịch hẹn thành công.'),
('am000001-0000-0000-0000-000000000005', 'MSG_INFO_0005', 'vi', 'Hồ sơ bệnh nhân đã được cập nhật.'),
('am000001-0000-0000-0000-000000000006', 'MSG_INFO_0006', 'vi', 'Hóa đơn đã được thanh toán.'),
('am000001-0000-0000-0000-000000000007', 'MSG_INFO_0007', 'vi', 'Tài khoản đã được tạo thành công.'),
('am000001-0000-0000-0000-000000000008', 'MSG_INFO_0008', 'vi', 'Mật khẩu đã được thay đổi thành công.'),
-- WARN
('am000001-0000-0000-0000-000000000058', 'MSG_INFO_0009', 'vi', 'Đăng xuất thành công.'),
-- ERR (nghiệp vụ)
('am000001-0000-0000-0000-000000000014', 'MSG_ERR_0002',  'vi', 'Tài khoản đã bị khóa do đăng nhập sai quá 5 lần.'),
('am000001-0000-0000-0000-000000000017', 'MSG_ERR_0005',  'vi', 'Mã OTP không hợp lệ hoặc đã hết hạn.'),
-- ERR (common — dùng bởi GlobalExceptionFilter cho lỗi chung)
('am000001-0000-0000-0000-000000000035', 'MSG_ERR_0006',  'vi', 'Dữ liệu nhập không hợp lệ. Vui lòng kiểm tra lại thông tin đã nhập.'),
('am000001-0000-0000-0000-000000000036', 'MSG_ERR_0007',  'vi', 'Phiên đăng nhập không hợp lệ hoặc đã hết hạn.'),
('am000001-0000-0000-0000-000000000037', 'MSG_ERR_0008',  'vi', 'Bạn không có quyền thực hiện hành động này.'),
('am000001-0000-0000-0000-000000000038', 'MSG_ERR_0009',  'vi', 'Không tìm thấy {resource}.'),
('am000001-0000-0000-0000-000000000039', 'MSG_ERR_0010',  'vi', '{resource} đã tồn tại hoặc bị xung đột.'),
('am000001-0000-0000-0000-000000000040', 'MSG_ERR_0011',  'vi', 'Lỗi hệ thống. Vui lòng thử lại sau.'),
('am000001-0000-0000-0000-000000000041', 'MSG_ERR_0012',  'vi', 'Email hoặc mật khẩu không đúng.'),
('am000001-0000-0000-0000-000000000049', 'MSG_ERR_0013',  'vi', 'Mật khẩu mới phải có tối thiểu 8 ký tự, gồm chữ và số.'),
('am000001-0000-0000-0000-000000000050', 'MSG_ERR_0014',  'vi', 'Tài khoản đã bị vô hiệu hóa. Vui lòng liên hệ quản trị viên.'),
('am000001-0000-0000-0000-000000000051', 'MSG_ERR_0015',  'vi', 'Mật khẩu mới không được trùng với mật khẩu cũ.'),

-- INFO (en)
('am000001-0000-0000-0000-000000000018', 'MSG_INFO_0001', 'en', 'Login successful.'),
('am000001-0000-0000-0000-000000000019', 'MSG_INFO_0002', 'en', 'Appointment confirmed.'),
('am000001-0000-0000-0000-000000000021', 'MSG_INFO_0004', 'en', 'Appointment booked successfully.'),
('am000001-0000-0000-0000-000000000022', 'MSG_INFO_0005', 'en', 'Patient profile updated.'),
('am000001-0000-0000-0000-000000000023', 'MSG_INFO_0006', 'en', 'Invoice has been paid.'),
('am000001-0000-0000-0000-000000000024', 'MSG_INFO_0007', 'en', 'Account created successfully.'),
('am000001-0000-0000-0000-000000000025', 'MSG_INFO_0008', 'en', 'Password changed successfully.'),
('am000001-0000-0000-0000-000000000057', 'MSG_INFO_0009', 'en', 'Logged out successfully.'),
-- WARN (en)
-- ERR (en, nghiệp vụ)
('am000001-0000-0000-0000-000000000031', 'MSG_ERR_0002',  'en', 'Account locked due to too many failed login attempts.'),
('am000001-0000-0000-0000-000000000034', 'MSG_ERR_0005',  'en', 'Invalid or expired OTP code.'),
-- ERR (en, common)
('am000001-0000-0000-0000-000000000042', 'MSG_ERR_0006',  'en', 'Invalid request data. Please check your input.'),
('am000001-0000-0000-0000-000000000043', 'MSG_ERR_0007',  'en', 'Invalid or expired session.'),
('am000001-0000-0000-0000-000000000044', 'MSG_ERR_0008',  'en', 'You do not have permission to perform this action.'),
('am000001-0000-0000-0000-000000000045', 'MSG_ERR_0009',  'en', '{resource} not found.'),
('am000001-0000-0000-0000-000000000046', 'MSG_ERR_0010',  'en', '{resource} already exists or conflicts.'),
('am000001-0000-0000-0000-000000000047', 'MSG_ERR_0011',  'en', 'System error. Please try again later.'),
('am000001-0000-0000-0000-000000000048', 'MSG_ERR_0012',  'en', 'Invalid email or password.'),
('am000001-0000-0000-0000-000000000052', 'MSG_ERR_0013',  'en', 'New password must be at least 8 characters and contain letters and digits.'),
('am000001-0000-0000-0000-000000000053', 'MSG_ERR_0014',  'en', 'This account has been disabled. Please contact an administrator.'),
('am000001-0000-0000-0000-000000000054', 'MSG_ERR_0015',  'en', 'New password must be different from the current password.'),

-- =============================================================
-- app_messages — phần mở rộng (121 mã mới: MSG_INFO_0010-0079,
-- MSG_WARN_0005-0014, MSG_ERR_0017-0055), theo docs/system_messages.md
-- =============================================================
('am000002-0000-0000-0000-000000000001', 'MSG_INFO_0010', 'vi', 'Mã OTP đã được gửi đến {email}. Mã có hiệu lực trong 10 phút.'),
('am000002-0000-0000-0000-000000000002', 'MSG_INFO_0011', 'vi', 'Mật khẩu đã được đặt lại thành công. Vui lòng đăng nhập với mật khẩu mới.'),
('am000002-0000-0000-0000-000000000003', 'MSG_INFO_0012', 'vi', 'Hồ sơ cá nhân đã được cập nhật thành công.'),
('am000002-0000-0000-0000-000000000004', 'MSG_INFO_0013', 'vi', 'Cập nhật tài khoản thành công.'),
('am000002-0000-0000-0000-000000000005', 'MSG_INFO_0014', 'vi', 'Đã kích hoạt tài khoản {full_name}.'),
('am000002-0000-0000-0000-000000000006', 'MSG_INFO_0015', 'vi', 'Đã vô hiệu hóa tài khoản {full_name}.'),
('am000002-0000-0000-0000-000000000007', 'MSG_INFO_0016', 'vi', 'Đã mở khóa tài khoản {full_name}.'),
('am000002-0000-0000-0000-000000000008', 'MSG_INFO_0017', 'vi', 'Đặt lại mật khẩu thành công. Người dùng cần đổi mật khẩu khi đăng nhập lần tới.'),
('am000002-0000-0000-0000-000000000009', 'MSG_INFO_0018', 'vi', 'Hồ sơ bệnh nhân đã được tạo thành công. Mã hồ sơ: {patient_code}.'),
('am000002-0000-0000-0000-000000000012', 'MSG_INFO_0021', 'vi', 'Phòng {room_code} đã được tạo thành công.'),
('am000002-0000-0000-0000-000000000013', 'MSG_INFO_0022', 'vi', 'Thông tin phòng đã được cập nhật thành công.'),
('am000002-0000-0000-0000-000000000014', 'MSG_INFO_0023', 'vi', 'Phòng {room_code} đã được kích hoạt.'),
('am000002-0000-0000-0000-000000000015', 'MSG_INFO_0024', 'vi', 'Phòng {room_code} đã được vô hiệu hóa.'),
('am000002-0000-0000-0000-000000000016', 'MSG_INFO_0025', 'vi', 'Dịch vụ đã được thêm thành công.'),
('am000002-0000-0000-0000-000000000017', 'MSG_INFO_0026', 'vi', 'Dịch vụ đã được cập nhật thành công.'),
('am000002-0000-0000-0000-000000000018', 'MSG_INFO_0027', 'vi', 'Dịch vụ đã được xóa thành công.'),
('am000002-0000-0000-0000-000000000021', 'MSG_INFO_0030', 'vi', 'Hồ sơ chuyên môn bác sĩ đã được cập nhật thành công.'),
('am000002-0000-0000-0000-000000000022', 'MSG_INFO_0031', 'vi', 'Lịch làm việc đã được tạo thành công.'),
('am000002-0000-0000-0000-000000000023', 'MSG_INFO_0032', 'vi', 'Lịch làm việc đã được cập nhật thành công.'),
('am000002-0000-0000-0000-000000000024', 'MSG_INFO_0033', 'vi', 'Lịch làm việc đã được xóa.'),
('am000002-0000-0000-0000-000000000025', 'MSG_INFO_0034', 'vi', 'Lịch hẹn đã được tạo và xác nhận thành công.'),
('am000002-0000-0000-0000-000000000026', 'MSG_INFO_0035', 'vi', 'Đã từ chối lịch hẹn. Thông báo đã gửi đến bệnh nhân.'),
('am000002-0000-0000-0000-000000000027', 'MSG_INFO_0036', 'vi', 'Lịch hẹn đã được cập nhật thành công.'),
('am000002-0000-0000-0000-000000000028', 'MSG_INFO_0037', 'vi', 'Lịch hẹn đã được hủy. Thông báo đã gửi đến bệnh nhân và bác sĩ.'),
('am000002-0000-0000-0000-000000000029', 'MSG_INFO_0038', 'vi', 'Check-in thành công. Bệnh nhân đang vào hàng chờ khám.'),
('am000002-0000-0000-0000-000000000035', 'MSG_INFO_0044', 'vi', 'Đã gọi bệnh nhân {patient_name} vào phòng {room_code}.'),
('am000002-0000-0000-0000-000000000036', 'MSG_INFO_0045', 'vi', 'Bắt đầu khám bệnh nhân {patient_name}.'),
('am000002-0000-0000-0000-000000000037', 'MSG_INFO_0046', 'vi', 'Đã hoàn thành khám bệnh nhân {patient_name}.'),
('am000002-0000-0000-0000-000000000038', 'MSG_INFO_0047', 'vi', 'Phiếu chỉ định CLS đã được tạo thành công.'),
('am000002-0000-0000-0000-000000000039', 'MSG_INFO_0048', 'vi', 'Đã gọi bệnh nhân vào phòng {room_code}.'),
('am000002-0000-0000-0000-000000000040', 'MSG_INFO_0049', 'vi', 'Kết quả CLS đã được cập nhật.'),
('am000002-0000-0000-0000-000000000042', 'MSG_INFO_0051', 'vi', 'File đính kèm đã được tải lên thành công.'),
('am000002-0000-0000-0000-000000000043', 'MSG_INFO_0052', 'vi', 'Kết quả khám đã được lưu thành công.'),
('am000002-0000-0000-0000-000000000044', 'MSG_INFO_0053', 'vi', 'Kết quả khám đã được cập nhật.'),
('am000002-0000-0000-0000-000000000046', 'MSG_INFO_0055', 'vi', 'Đơn thuốc đã được tạo và lưu thành công.'),
('am000002-0000-0000-0000-000000000051', 'MSG_INFO_0060', 'vi', 'Hóa đơn {invoice_code} đã được tạo thành công.'),
('am000002-0000-0000-0000-000000000054', 'MSG_INFO_0063', 'vi', 'Danh mục vật tư đã được tạo thành công.'),
('am000002-0000-0000-0000-000000000055', 'MSG_INFO_0064', 'vi', 'Danh mục vật tư đã được cập nhật.'),
('am000002-0000-0000-0000-000000000056', 'MSG_INFO_0065', 'vi', 'Danh mục vật tư đã được xóa.'),
('am000002-0000-0000-0000-000000000057', 'MSG_INFO_0066', 'vi', 'Nhà cung cấp đã được thêm thành công.'),
('am000002-0000-0000-0000-000000000058', 'MSG_INFO_0067', 'vi', 'Thông tin nhà cung cấp đã được cập nhật.'),
('am000002-0000-0000-0000-000000000059', 'MSG_INFO_0068', 'vi', 'Nhà cung cấp đã được xóa.'),
('am000002-0000-0000-0000-000000000060', 'MSG_INFO_0069', 'vi', 'Vật tư đã được thêm thành công.'),
('am000002-0000-0000-0000-000000000061', 'MSG_INFO_0070', 'vi', 'Thông tin vật tư đã được cập nhật.'),
('am000002-0000-0000-0000-000000000062', 'MSG_INFO_0071', 'vi', 'Nhập kho thành công. Tồn kho hiện tại: {current_stock} {unit}.'),
('am000002-0000-0000-0000-000000000063', 'MSG_INFO_0072', 'vi', 'Đã phân phối {quantity} {unit} {supply_name} cho phòng {room_code}.'),
('am000002-0000-0000-0000-000000000067', 'MSG_INFO_0076', 'vi', 'Thuốc đã được thêm vào danh mục thành công.'),
('am000002-0000-0000-0000-000000000068', 'MSG_INFO_0077', 'vi', 'Thông tin thuốc đã được cập nhật.'),
('am000002-0000-0000-0000-000000000069', 'MSG_INFO_0078', 'vi', 'Thuốc đã được xóa khỏi danh mục.'),
('am000003-0000-0000-0000-000000000001', 'MSG_INFO_0080', 'vi', 'Đã tạm rời phòng khám, chờ kết quả CLS cho bệnh nhân {patient_name}.'),
('am000003-0000-0000-0000-000000000002', 'MSG_INFO_0081', 'vi', 'Đã ghi nhận bệnh nhân {patient_name} vắng mặt.'),
('am000003-0000-0000-0000-000000000006', 'MSG_INFO_0083', 'vi', 'Đã đánh dấu thông báo là đã đọc.'),
('am000003-0000-0000-0000-000000000007', 'MSG_INFO_0084', 'vi', 'Đã đánh dấu tất cả thông báo là đã đọc.'),
('am000003-0000-0000-0000-000000000010', 'MSG_INFO_0087', 'vi', 'Đã tạo lịch làm việc hàng loạt.'),
('am000003-0000-0000-0000-000000000011', 'MSG_INFO_0088', 'vi', 'Đã cập nhật phiếu chỉ định CLS.'),
('am000003-0000-0000-0000-000000000012', 'MSG_INFO_0089', 'vi', 'Đã lưu chỉ số sinh hiệu.'),
('am000002-0000-0000-0000-000000000092', 'MSG_ERR_0028', 'vi', 'Không thể xóa dịch vụ đang được dùng trong lịch hẹn hoặc hóa đơn.'),
('am000002-0000-0000-0000-000000000095', 'MSG_ERR_0031', 'vi', 'Nhân viên này đã có lịch trực ca {shift} ngày {date}. Không thể tạo thêm.'),
('am000002-0000-0000-0000-000000000096', 'MSG_ERR_0032', 'vi', 'Không thể xóa lịch làm việc đang có lịch hẹn liên kết.'),
('am000002-0000-0000-0000-000000000097', 'MSG_ERR_0033', 'vi', 'Bác sĩ này không có lịch trực trong khung giờ đã chọn. Vui lòng chọn khung giờ khác.'),
('am000002-0000-0000-0000-000000000098', 'MSG_ERR_0034', 'vi', 'Vui lòng nhập lý do hủy lịch hẹn.'),
('am000002-0000-0000-0000-000000000099', 'MSG_ERR_0035', 'vi', 'Không thể hủy lịch hẹn đang ở trạng thái Check-in hoặc Đang khám.'),
('am000002-0000-0000-0000-000000000100', 'MSG_ERR_0036', 'vi', 'Chỉ có thể cập nhật lịch hẹn ở trạng thái Chờ xác nhận hoặc Đã xác nhận.'),
('am000002-0000-0000-0000-000000000101', 'MSG_ERR_0037', 'vi', 'Bác sĩ đã có lịch hẹn khác trong khung giờ này. Vui lòng chọn giờ khác.'),
('am000002-0000-0000-0000-000000000102', 'MSG_ERR_0038', 'vi', 'Vui lòng nhập lý do từ chối trước khi xác nhận.'),
('am000002-0000-0000-0000-000000000108', 'MSG_ERR_0044', 'vi', 'Lịch hẹn này đã có hóa đơn. Không thể tạo thêm.'),
('am000002-0000-0000-0000-000000000109', 'MSG_ERR_0045', 'vi', 'Chỉ có thể tạo hóa đơn cho lịch hẹn đã hoàn thành khám.'),
('am000002-0000-0000-0000-000000000110', 'MSG_ERR_0046', 'vi', 'Tên danh mục này đã tồn tại. Vui lòng đặt tên khác.'),
('am000002-0000-0000-0000-000000000111', 'MSG_ERR_0047', 'vi', 'Không thể xóa danh mục đang có vật tư. Hãy di chuyển hoặc xóa vật tư trước.'),
('am000002-0000-0000-0000-000000000112', 'MSG_ERR_0048', 'vi', 'Tên nhà cung cấp này đã tồn tại. Vui lòng đặt tên khác.'),
('am000002-0000-0000-0000-000000000113', 'MSG_ERR_0049', 'vi', 'Tồn kho không đủ. Hiện có: {current_stock} {unit}, yêu cầu: {quantity} {unit}.'),
('am000002-0000-0000-0000-000000000114', 'MSG_ERR_0050', 'vi', 'Số lượng phải lớn hơn 0.'),
('am000002-0000-0000-0000-000000000115', 'MSG_ERR_0051', 'vi', 'Tên thuốc này đã tồn tại trong danh mục. Vui lòng kiểm tra lại.'),
('am000002-0000-0000-0000-000000000116', 'MSG_ERR_0052', 'vi', 'Không thể xóa thuốc đang được sử dụng trong đơn thuốc của bệnh nhân.'),
('am000002-0000-0000-0000-000000000240', 'MSG_ERR_0057', 'vi', 'Dịch vụ này chưa được gán chuyên khoa.'),
('am000003-0000-0000-0000-000000000004', 'MSG_ERR_0058', 'vi', 'Phòng này đã được gán cho nhân viên khác trong ca {shift} ngày {date}.'),
('am000003-0000-0000-0000-000000000005', 'MSG_ERR_0059', 'vi', 'Chưa có phiếu chỉ định CLS nào cho lượt khám này.'),
('am000004-0000-0000-0000-000000000007', 'MSG_ERR_0061', 'vi', 'Khoảng ngày không hợp lệ (ngày kết thúc phải sau ngày bắt đầu).'),
('am000003-0000-0000-0000-000000000013', 'MSG_ERR_0062', 'vi', 'Khung giờ này đã ở trong quá khứ, vui lòng chọn khung giờ khác.'),
('am000003-0000-0000-0000-000000000014', 'MSG_ERR_0063', 'vi', 'Chỉ có thể check-in đúng ngày hẹn khám.'),
('am000003-0000-0000-0000-000000000015', 'MSG_ERR_0064', 'vi', 'Phòng khám đang có bệnh nhân đang được khám.'),
('am000003-0000-0000-0000-000000000016', 'MSG_ERR_0065', 'vi', 'Vui lòng nhập phiếu kết quả khám trước khi hoàn tất.'),
('am000003-0000-0000-0000-000000000117', 'MSG_ERR_0066', 'vi', 'Mật khẩu mới và xác nhận mật khẩu không khớp.'),
('am000003-0000-0000-0000-000000000119', 'MSG_ERR_0067', 'vi', 'Không thể xóa vật tư còn tồn kho. Vui lòng phân phối hết hoặc điều chỉnh tồn kho về 0 trước.'),
('am000003-0000-0000-0000-000000000120', 'MSG_ERR_0068', 'vi', 'Không thể xóa vật tư đã có lịch sử giao dịch.'),
('am000003-0000-0000-0000-000000000123', 'MSG_ERR_0069', 'vi', 'Không thể xóa nhà cung cấp còn gắn với lô vật tư đã nhập.'),
('am000003-0000-0000-0000-000000000125', 'MSG_ERR_0070', 'vi', 'Phòng khám nghỉ trưa từ 12:00 đến 13:00, vui lòng chọn khung giờ khác.'),
('am000004-0000-0000-0000-000000000001', 'MSG_ERR_0071', 'vi', 'Dịch vụ CLS phải chọn loại phòng thực hiện.'),
('am000004-0000-0000-0000-000000000003', 'MSG_ERR_0072', 'vi', 'Dịch vụ khám không được gán loại phòng CLS.'),
('am000004-0000-0000-0000-000000000005', 'MSG_ERR_0073', 'vi', 'Dịch vụ CLS không khớp với loại phòng đã chọn.'),
('am000004-0000-0000-0000-000000000009', 'MSG_ERR_0074', 'vi', 'Dịch vụ này không phải dịch vụ khám, không thể dùng để đặt/sửa lịch hẹn.'),
('am000004-0000-0000-0000-000000000011', 'MSG_ERR_0075', 'vi', 'Lịch hẹn chưa được xác nhận, không thể thực hiện thao tác này.'),
('am000004-0000-0000-0000-000000000012', 'MSG_ERR_0076', 'vi', 'Lịch hẹn không ở trạng thái chờ xác nhận, không thể thực hiện thao tác này.'),
('am000004-0000-0000-0000-000000000013', 'MSG_ERR_0077', 'vi', 'Bệnh nhân chưa được tiếp đón (check-in), không thể thực hiện thao tác này.'),
('am000004-0000-0000-0000-000000000014', 'MSG_ERR_0078', 'vi', 'Lượt khám không ở trạng thái chờ, không thể thực hiện thao tác này.'),
('am000004-0000-0000-0000-000000000015', 'MSG_ERR_0079', 'vi', 'Lượt khám không ở trạng thái đang khám, không thể thực hiện thao tác này.'),
('am000004-0000-0000-0000-000000000016', 'MSG_ERR_0080', 'vi', 'Không thể gọi bệnh nhân ở trạng thái hiện tại của lượt khám.'),
('am000004-0000-0000-0000-000000000017', 'MSG_ERR_0081', 'vi', 'Không thể bắt đầu khám ở trạng thái hiện tại của lượt khám.'),
('am000004-0000-0000-0000-000000000018', 'MSG_ERR_0082', 'vi', 'Không thể tạm giữ lượt khám ở trạng thái hiện tại.'),
('am000004-0000-0000-0000-000000000019', 'MSG_ERR_0083', 'vi', 'Lượt khám chưa được gọi, không thể thực hiện thao tác này.'),
('am000004-0000-0000-0000-000000000020', 'MSG_ERR_0084', 'vi', 'Không thể in phiếu số thứ tự ở trạng thái hiện tại của lượt khám.'),
('am000004-0000-0000-0000-000000000021', 'MSG_ERR_0085', 'vi', 'Phiếu chỉ định CLS không ở trạng thái chờ thực hiện.'),
('am000004-0000-0000-0000-000000000022', 'MSG_ERR_0086', 'vi', 'Phiếu chỉ định CLS không ở trạng thái đang thực hiện.'),
('am000004-0000-0000-0000-000000000023', 'MSG_ERR_0087', 'vi', 'Phòng CLS đang bận, vui lòng thử lại sau.'),
('am000004-0000-0000-0000-000000000024', 'MSG_ERR_0088', 'vi', 'Lượt khám còn phiếu chỉ định CLS chưa hoàn thành.'),
('am000004-0000-0000-0000-000000000025', 'MSG_ERR_0089', 'vi', 'Kết quả khám cho lượt khám này đã tồn tại.'),
('am000004-0000-0000-0000-000000000026', 'MSG_ERR_0090', 'vi', 'Mã tra cứu đã hết hạn.'),
('am000004-0000-0000-0000-000000000027', 'MSG_ERR_0091', 'vi', 'Đơn thuốc cho lượt khám này đã tồn tại.'),
('am000004-0000-0000-0000-000000000028', 'MSG_ERR_0092', 'vi', 'Hóa đơn này đã được thanh toán, không thể thực hiện lại thao tác.'),
('am000004-0000-0000-0000-000000000029', 'MSG_ERR_0093', 'vi', 'Dịch vụ tóm tắt AI hiện không khả dụng. Vui lòng thử lại sau.'),
('am000004-0000-0000-0000-000000000030', 'MSG_ERR_0094', 'vi', 'Đã vượt giới hạn số lần gọi AI, vui lòng thử lại sau ít phút.'),
('am000002-0000-0000-0000-000000000120', 'MSG_INFO_0010', 'en', 'OTP code has been sent to {email}. Code is valid for 10 minutes.'),
('am000002-0000-0000-0000-000000000121', 'MSG_INFO_0011', 'en', 'Password has been reset successfully. Please log in with your new password.'),
('am000002-0000-0000-0000-000000000122', 'MSG_INFO_0012', 'en', 'Personal profile updated successfully.'),
('am000002-0000-0000-0000-000000000123', 'MSG_INFO_0013', 'en', 'Account updated successfully.'),
('am000002-0000-0000-0000-000000000124', 'MSG_INFO_0014', 'en', 'Account {full_name} has been activated.'),
('am000002-0000-0000-0000-000000000125', 'MSG_INFO_0015', 'en', 'Account {full_name} has been deactivated.'),
('am000002-0000-0000-0000-000000000126', 'MSG_INFO_0016', 'en', 'Account {full_name} has been unlocked.'),
('am000002-0000-0000-0000-000000000127', 'MSG_INFO_0017', 'en', 'Password reset successfully. The user must change their password on next login.'),
('am000002-0000-0000-0000-000000000128', 'MSG_INFO_0018', 'en', 'Patient record created successfully. Patient code: {patient_code}.'),
('am000002-0000-0000-0000-000000000131', 'MSG_INFO_0021', 'en', 'Room {room_code} has been created successfully.'),
('am000002-0000-0000-0000-000000000132', 'MSG_INFO_0022', 'en', 'Room information updated successfully.'),
('am000002-0000-0000-0000-000000000133', 'MSG_INFO_0023', 'en', 'Room {room_code} has been activated.'),
('am000002-0000-0000-0000-000000000134', 'MSG_INFO_0024', 'en', 'Room {room_code} has been deactivated.'),
('am000002-0000-0000-0000-000000000135', 'MSG_INFO_0025', 'en', 'Service added successfully.'),
('am000002-0000-0000-0000-000000000136', 'MSG_INFO_0026', 'en', 'Service updated successfully.'),
('am000002-0000-0000-0000-000000000137', 'MSG_INFO_0027', 'en', 'Service deleted successfully.'),
('am000002-0000-0000-0000-000000000140', 'MSG_INFO_0030', 'en', 'Doctor profile updated successfully.'),
('am000002-0000-0000-0000-000000000141', 'MSG_INFO_0031', 'en', 'Work schedule created successfully.'),
('am000002-0000-0000-0000-000000000142', 'MSG_INFO_0032', 'en', 'Work schedule updated successfully.'),
('am000002-0000-0000-0000-000000000143', 'MSG_INFO_0033', 'en', 'Work schedule deleted.'),
('am000002-0000-0000-0000-000000000144', 'MSG_INFO_0034', 'en', 'Appointment created and confirmed successfully.'),
('am000002-0000-0000-0000-000000000145', 'MSG_INFO_0035', 'en', 'Appointment rejected. Notification sent to patient.'),
('am000002-0000-0000-0000-000000000146', 'MSG_INFO_0036', 'en', 'Appointment updated successfully.'),
('am000002-0000-0000-0000-000000000147', 'MSG_INFO_0037', 'en', 'Appointment cancelled. Notification sent to patient and doctor.'),
('am000002-0000-0000-0000-000000000148', 'MSG_INFO_0038', 'en', 'Check-in successful. Patient is now in the waiting queue.'),
('am000002-0000-0000-0000-000000000154', 'MSG_INFO_0044', 'en', 'Patient {patient_name} has been called to room {room_code}.'),
('am000002-0000-0000-0000-000000000155', 'MSG_INFO_0045', 'en', 'Examination started for patient {patient_name}.'),
('am000002-0000-0000-0000-000000000156', 'MSG_INFO_0046', 'en', 'Examination completed for patient {patient_name}.'),
('am000002-0000-0000-0000-000000000157', 'MSG_INFO_0047', 'en', 'Lab/diagnostic order created successfully.'),
('am000002-0000-0000-0000-000000000158', 'MSG_INFO_0048', 'en', 'Patient has been called to room {room_code}.'),
('am000002-0000-0000-0000-000000000159', 'MSG_INFO_0049', 'en', 'Lab/diagnostic result updated.'),
('am000002-0000-0000-0000-000000000161', 'MSG_INFO_0051', 'en', 'Attachment uploaded successfully.'),
('am000002-0000-0000-0000-000000000162', 'MSG_INFO_0052', 'en', 'Examination result saved successfully.'),
('am000002-0000-0000-0000-000000000163', 'MSG_INFO_0053', 'en', 'Examination result updated.'),
('am000002-0000-0000-0000-000000000165', 'MSG_INFO_0055', 'en', 'Prescription created and saved successfully.'),
('am000002-0000-0000-0000-000000000170', 'MSG_INFO_0060', 'en', 'Invoice {invoice_code} created successfully.'),
('am000002-0000-0000-0000-000000000173', 'MSG_INFO_0063', 'en', 'Supply category created successfully.'),
('am000002-0000-0000-0000-000000000174', 'MSG_INFO_0064', 'en', 'Supply category updated.'),
('am000002-0000-0000-0000-000000000175', 'MSG_INFO_0065', 'en', 'Supply category deleted.'),
('am000002-0000-0000-0000-000000000176', 'MSG_INFO_0066', 'en', 'Supplier added successfully.'),
('am000002-0000-0000-0000-000000000177', 'MSG_INFO_0067', 'en', 'Supplier information updated.'),
('am000002-0000-0000-0000-000000000178', 'MSG_INFO_0068', 'en', 'Supplier removed.'),
('am000002-0000-0000-0000-000000000179', 'MSG_INFO_0069', 'en', 'Supply item added successfully.'),
('am000002-0000-0000-0000-000000000180', 'MSG_INFO_0070', 'en', 'Supply item information updated.'),
('am000002-0000-0000-0000-000000000181', 'MSG_INFO_0071', 'en', 'Stock import successful. Current stock: {current_stock} {unit}.'),
('am000002-0000-0000-0000-000000000182', 'MSG_INFO_0072', 'en', 'Distributed {quantity} {unit} of {supply_name} to room {room_code}.'),
('am000002-0000-0000-0000-000000000186', 'MSG_INFO_0076', 'en', 'Medicine added to catalogue successfully.'),
('am000002-0000-0000-0000-000000000187', 'MSG_INFO_0077', 'en', 'Medicine information updated.'),
('am000002-0000-0000-0000-000000000188', 'MSG_INFO_0078', 'en', 'Medicine removed from catalogue.'),
('am000003-0000-0000-0000-000000000101', 'MSG_INFO_0080', 'en', 'Left the exam room, awaiting CLS results for patient {patient_name}.'),
('am000003-0000-0000-0000-000000000102', 'MSG_INFO_0081', 'en', 'Patient {patient_name} marked as absent.'),
('am000003-0000-0000-0000-000000000106', 'MSG_INFO_0083', 'en', 'Notification marked as read.'),
('am000003-0000-0000-0000-000000000107', 'MSG_INFO_0084', 'en', 'All notifications marked as read.'),
('am000003-0000-0000-0000-000000000110', 'MSG_INFO_0087', 'en', 'Bulk work schedule created.'),
('am000003-0000-0000-0000-000000000111', 'MSG_INFO_0088', 'en', 'CLS order updated.'),
('am000003-0000-0000-0000-000000000112', 'MSG_INFO_0089', 'en', 'Vital signs saved.'),
('am000002-0000-0000-0000-000000000211', 'MSG_ERR_0028', 'en', 'Cannot delete a service currently used in appointments or invoices.'),
('am000002-0000-0000-0000-000000000214', 'MSG_ERR_0031', 'en', 'This staff member already has a {shift} shift scheduled on {date}. Cannot create another.'),
('am000002-0000-0000-0000-000000000215', 'MSG_ERR_0032', 'en', 'Cannot delete a work schedule that has linked appointments.'),
('am000002-0000-0000-0000-000000000216', 'MSG_ERR_0033', 'en', 'This doctor is not scheduled during the selected time slot. Please choose a different time.'),
('am000002-0000-0000-0000-000000000217', 'MSG_ERR_0034', 'en', 'Please provide a reason for cancelling the appointment.'),
('am000002-0000-0000-0000-000000000218', 'MSG_ERR_0035', 'en', 'Cannot cancel an appointment that is in Check-in or In-progress status.'),
('am000002-0000-0000-0000-000000000219', 'MSG_ERR_0036', 'en', 'Appointments can only be updated when in Pending or Confirmed status.'),
('am000002-0000-0000-0000-000000000220', 'MSG_ERR_0037', 'en', 'Doctor already has another appointment in this time slot. Please choose a different time.'),
('am000002-0000-0000-0000-000000000221', 'MSG_ERR_0038', 'en', 'Please enter a reason for rejection before confirming.'),
('am000002-0000-0000-0000-000000000227', 'MSG_ERR_0044', 'en', 'This appointment already has an invoice. Cannot create another.'),
('am000002-0000-0000-0000-000000000228', 'MSG_ERR_0045', 'en', 'Invoices can only be created for completed appointments.'),
('am000002-0000-0000-0000-000000000229', 'MSG_ERR_0046', 'en', 'This category name already exists. Please use a different name.'),
('am000002-0000-0000-0000-000000000230', 'MSG_ERR_0047', 'en', 'Cannot delete a category that contains supplies. Move or delete supplies first.'),
('am000002-0000-0000-0000-000000000231', 'MSG_ERR_0048', 'en', 'This supplier name already exists. Please use a different name.'),
('am000002-0000-0000-0000-000000000232', 'MSG_ERR_0049', 'en', 'Insufficient stock. Available: {current_stock} {unit}, requested: {quantity} {unit}.'),
('am000002-0000-0000-0000-000000000233', 'MSG_ERR_0050', 'en', 'Quantity must be greater than 0.'),
('am000002-0000-0000-0000-000000000234', 'MSG_ERR_0051', 'en', 'This medicine name already exists in the catalogue. Please check again.'),
('am000002-0000-0000-0000-000000000235', 'MSG_ERR_0052', 'en', 'Cannot delete medicine currently used in patient prescriptions.'),
('am000002-0000-0000-0000-000000000242', 'MSG_ERR_0057', 'en', 'This service has not been assigned a specialty.'),
('am000003-0000-0000-0000-000000000104', 'MSG_ERR_0058', 'en', 'This room is already assigned to another staff member for {shift} shift on {date}.'),
('am000003-0000-0000-0000-000000000105', 'MSG_ERR_0059', 'en', 'No CLS order exists for this visit yet.'),
('am000004-0000-0000-0000-000000000008', 'MSG_ERR_0061', 'en', 'Invalid date range (end date must be after start date).'),
('am000003-0000-0000-0000-000000000113', 'MSG_ERR_0062', 'en', 'This time slot is in the past — please choose another slot.'),
('am000003-0000-0000-0000-000000000114', 'MSG_ERR_0063', 'en', 'Check-in is only allowed on the appointment''s own day.'),
('am000003-0000-0000-0000-000000000115', 'MSG_ERR_0064', 'en', 'The exam room is currently occupied with another patient.'),
('am000003-0000-0000-0000-000000000116', 'MSG_ERR_0065', 'en', 'Examination result is required before completing the visit.'),
('am000003-0000-0000-0000-000000000118', 'MSG_ERR_0066', 'en', 'New password and confirmation do not match.'),
('am000003-0000-0000-0000-000000000121', 'MSG_ERR_0067', 'en', 'Cannot delete a supply item that still has stock on hand. Distribute the remaining stock or bring it to 0 first.'),
('am000003-0000-0000-0000-000000000122', 'MSG_ERR_0068', 'en', 'Cannot delete a supply item that already has transaction history.'),
('am000003-0000-0000-0000-000000000124', 'MSG_ERR_0069', 'en', 'Cannot delete a supplier that still has supply import batches.'),
('am000003-0000-0000-0000-000000000126', 'MSG_ERR_0070', 'en', 'The clinic is closed for lunch from 12:00 to 13:00 — please choose another time.'),
('am000004-0000-0000-0000-000000000002', 'MSG_ERR_0071', 'en', 'A CLS service must specify which room category it belongs to.'),
('am000004-0000-0000-0000-000000000004', 'MSG_ERR_0072', 'en', 'An EXAMINATION service cannot be assigned a CLS room category.'),
('am000004-0000-0000-0000-000000000006', 'MSG_ERR_0073', 'en', 'This CLS service does not match the selected room''s category.'),
('am000004-0000-0000-0000-000000000010', 'MSG_ERR_0074', 'en', 'This service is not a bookable exam service and cannot be used for an appointment.'),
('am000004-0000-0000-0000-000000000031', 'MSG_ERR_0075', 'en', 'This appointment has not been confirmed yet.'),
('am000004-0000-0000-0000-000000000032', 'MSG_ERR_0076', 'en', 'This appointment is not in pending status.'),
('am000004-0000-0000-0000-000000000033', 'MSG_ERR_0077', 'en', 'The patient has not been checked in yet.'),
('am000004-0000-0000-0000-000000000034', 'MSG_ERR_0078', 'en', 'This visit is not in waiting status.'),
('am000004-0000-0000-0000-000000000035', 'MSG_ERR_0079', 'en', 'This visit is not in progress.'),
('am000004-0000-0000-0000-000000000036', 'MSG_ERR_0080', 'en', 'The patient cannot be called at the visit''s current status.'),
('am000004-0000-0000-0000-000000000037', 'MSG_ERR_0081', 'en', 'The exam cannot be started at the visit''s current status.'),
('am000004-0000-0000-0000-000000000038', 'MSG_ERR_0082', 'en', 'This visit cannot be put on hold at its current status.'),
('am000004-0000-0000-0000-000000000039', 'MSG_ERR_0083', 'en', 'This visit has not been called yet.'),
('am000004-0000-0000-0000-000000000040', 'MSG_ERR_0084', 'en', 'The queue ticket cannot be printed at the visit''s current status.'),
('am000004-0000-0000-0000-000000000041', 'MSG_ERR_0085', 'en', 'This CLS order is not in pending status.'),
('am000004-0000-0000-0000-000000000042', 'MSG_ERR_0086', 'en', 'This CLS order is not in progress.'),
('am000004-0000-0000-0000-000000000043', 'MSG_ERR_0087', 'en', 'The CLS room is currently busy, please try again later.'),
('am000004-0000-0000-0000-000000000044', 'MSG_ERR_0088', 'en', 'This visit still has incomplete CLS orders.'),
('am000004-0000-0000-0000-000000000045', 'MSG_ERR_0089', 'en', 'An examination result already exists for this visit.'),
('am000004-0000-0000-0000-000000000046', 'MSG_ERR_0090', 'en', 'This lookup code has expired.'),
('am000004-0000-0000-0000-000000000047', 'MSG_ERR_0091', 'en', 'A prescription already exists for this visit.'),
('am000004-0000-0000-0000-000000000048', 'MSG_ERR_0092', 'en', 'This invoice has already been paid.'),
('am000004-0000-0000-0000-000000000049', 'MSG_ERR_0093', 'en', 'The AI summary service is currently unavailable. Please try again later.'),
('am000004-0000-0000-0000-000000000050', 'MSG_ERR_0094', 'en', 'AI request rate limit exceeded, please try again in a few minutes.');

-- =============================================================
-- users
-- =============================================================
-- NOTE (2026-07-22): the plaintext behind these existing bcrypt hashes is
-- not documented anywhere in this repo (scripts/check-admin-passwords.js is
-- a brute-force guesser, not a source of truth), so they are left as-is
-- rather than guessed by hand. Staff hashes below should be regenerated to
-- bcrypt(DEFAULT_STAFF_PASSWORD) — see src/domain/value-objects/password-policy.vo.ts —
-- the next time someone can safely re-hash and verify a demo login.
INSERT INTO users (id, full_name, email, phone, password_hash, role, is_active, must_change_password) VALUES
('u0000001-0000-0000-0000-000000000001', 'Nguyễn Văn Admin',     'admin@aucophuha.vn',       '0900000001', '$2b$10$dDjB1vRuAn48FibkRVPWEu6HY4dqFzvQ2dJsRMxm1fnsO.wRfRT9i', 'ADMIN',        1, 0),
('u0000001-0000-0000-0000-000000000002', 'Trần Thị Lễ Tân',      'reception@aucophuha.vn',   '0900000002', '$2b$10$dDjB1vRuAn48FibkRVPWEu6HY4dqFzvQ2dJsRMxm1fnsO.wRfRT9i', 'RECEPTIONIST', 1, 0),
('u0000001-0000-0000-0000-000000000003', 'Lê Văn Sơn',           'dr.son@aucophuha.vn',      '0900000003', '$2b$10$dDjB1vRuAn48FibkRVPWEu6HY4dqFzvQ2dJsRMxm1fnsO.wRfRT9i', 'DOCTOR',       1, 0),
('u0000001-0000-0000-0000-000000000004', 'Phạm Thị Hoa',         'dr.hoa@aucophuha.vn',      '0900000004', '$2b$10$dDjB1vRuAn48FibkRVPWEu6HY4dqFzvQ2dJsRMxm1fnsO.wRfRT9i', 'DOCTOR',       1, 0),
('u0000001-0000-0000-0000-000000000005', 'Điều Dưỡng Nguyễn Mai','nurse.mai@aucophuha.vn',   '0900000005', '$2b$10$dDjB1vRuAn48FibkRVPWEu6HY4dqFzvQ2dJsRMxm1fnsO.wRfRT9i', 'NURSE',        1, 0),
('u0000001-0000-0000-0000-000000000006', 'KTV Trần Đức',         'lab.duc@aucophuha.vn',     '0900000006', '$2b$10$dDjB1vRuAn48FibkRVPWEu6HY4dqFzvQ2dJsRMxm1fnsO.wRfRT9i', 'LAB_TECH',     1, 0),
('u0000001-0000-0000-0000-000000000007', 'Nguyễn Văn An',        'patient@clinic.vn',     '0912345001', '$2b$10$dDjB1vRuAn48FibkRVPWEu6HY4dqFzvQ2dJsRMxm1fnsO.wRfRT9i', 'PATIENT',      1, 0),
('u0000001-0000-0000-0000-000000000011', 'Đặng Minh Admin',      'admin.demo@aucophuha.vn',  '0900000011', '$2b$10$dDjB1vRuAn48FibkRVPWEu6HY4dqFzvQ2dJsRMxm1fnsO.wRfRT9i', 'ADMIN',        1, 0),
('u0000001-0000-0000-0000-000000000009', 'Võ Thị Lễ Tân',        'reception.demo@aucophuha.vn', '0900000009', '$2b$10$dDjB1vRuAn48FibkRVPWEu6HY4dqFzvQ2dJsRMxm1fnsO.wRfRT9i', 'RECEPTIONIST', 1, 0),
('u0000001-0000-0000-0000-000000000010', 'Bùi Thị Minh Anh',     'patient.demo@clinic.vn','0912345010', '$2b$10$dDjB1vRuAn48FibkRVPWEu6HY4dqFzvQ2dJsRMxm1fnsO.wRfRT9i', 'PATIENT',      1, 0);

-- created_by self-reference update
UPDATE users SET created_by = 'u0000001-0000-0000-0000-000000000001';

-- =============================================================
-- specialties
-- =============================================================
-- 7 clinical specialties + 2 CLS specialties (Chẩn đoán hình ảnh covers
-- X-quang/Siêu âm rooms, Xét nghiệm covers lab rooms) — matches the real
-- department structure, not an arbitrary list. See
-- database/migrations/20260801_normalize_specialty_service_room_data.sql
-- and 20260801_add_imaging_lab_specialties_and_rooms.sql for the live-DB
-- migration this mirrors.
INSERT INTO specialties (id, name, description) VALUES
('sp000001-0000-0000-0000-000000000001', 'Chuyên khoa Nội',          'Khám và điều trị các bệnh lý nội khoa tổng quát'),
('sp000002-0000-0000-0000-000000000001', 'Tai Mũi Họng',             NULL),
('sp000002-0000-0000-0000-000000000002', 'Sản phụ khoa',             NULL),
('sp000002-0000-0000-0000-000000000003', 'Thăm dò chức năng',        NULL),
('sp000002-0000-0000-0000-000000000004', 'Chuyên khoa ngoại',        NULL),
('sp000002-0000-0000-0000-000000000005', 'Chuyên khoa mắt',          NULL),
('sp000002-0000-0000-0000-000000000006', 'Chuyên khoa Răng Hàm Mặt', NULL),
('sp000003-0000-0000-0000-000000000001', 'Chẩn đoán hình ảnh',       'Phòng X-quang, siêu âm'),
('sp000003-0000-0000-0000-000000000002', 'Xét nghiệm',               'Phòng xét nghiệm cận lâm sàng');

-- =============================================================
-- doctor_profiles
-- =============================================================
-- Phạm Thị Hoa was seeded under "Nhi khoa", which no longer exists as a
-- specialty (see the normalization above) — reassigned to Chuyên khoa Nội,
-- same as the equivalent real-roster remap.
INSERT INTO doctor_profiles (id, user_id, specialty_id, degree, years_experience, biography) VALUES
('dp000001-0000-0000-0000-000000000001', 'u0000001-0000-0000-0000-000000000003', 'sp000001-0000-0000-0000-000000000001', 'Thạc sĩ Y khoa', 10, 'Bác sĩ chuyên khoa Nội với 10 năm kinh nghiệm.'),
('dp000001-0000-0000-0000-000000000002', 'u0000001-0000-0000-0000-000000000004', 'sp000001-0000-0000-0000-000000000001', 'Bác sĩ CKI',     7,  'Bác sĩ chuyên khoa Nội với 7 năm kinh nghiệm.');

-- =============================================================
-- rooms
-- =============================================================
-- Full real production set (16 rooms) — extracted from live RDS 2026-08-02
-- before the instance was deleted (cost reasons). Replaces the earlier
-- minimal fixture 1:1 where ids match (PK-01/PK-02/CLS-01/CLS-02/OP-01/AD-01)
-- and adds the rest (PK-03..PK-10, CLS-03, CLS-04) so this file alone is a
-- complete restore point.
INSERT IGNORE INTO rooms (id, room_code, name, type, specialty_id, cls_category, description, is_active, created_by) VALUES
('r0000001-0000-0000-0000-000000000001', 'PK-01', 'Phòng khám Nội 1', 'EXAMINATION', 'sp000001-0000-0000-0000-000000000001', NULL, 'Phòng khám nội khoa tổng quát số 1', 1, 'u0000001-0000-0000-0000-000000000001'),
('r0000001-0000-0000-0000-000000000002', 'PK-02', 'Phòng khám Nội 2', 'EXAMINATION', 'sp000001-0000-0000-0000-000000000001', NULL, 'Phòng khám nhi khoa', 1, 'u0000001-0000-0000-0000-000000000001'),
('r0000001-0000-0000-0000-000000000003', 'CLS-01', 'Phòng Xét nghiệm', 'CLS', 'sp000003-0000-0000-0000-000000000002', 'LAB', 'Phòng thực hiện xét nghiệm máu và sinh hóa cơ bản', 1, 'u0000001-0000-0000-0000-000000000001'),
('r0000001-0000-0000-0000-000000000004', 'CLS-02', 'Phòng Siêu âm', 'CLS', 'sp000003-0000-0000-0000-000000000001', 'ULTRASOUND', 'Phòng siêu âm tổng quát', 1, 'u0000001-0000-0000-0000-000000000001'),
('f01956e2-70b3-454a-9165-c57654b9533b', 'CLS-03', 'Phòng X-quang', 'CLS', 'sp000003-0000-0000-0000-000000000001', 'XRAY', NULL, 1, 'u0000001-0000-0000-0000-000000000001'),
('r0000002-0000-0000-0000-000000000001', 'CLS-04', 'Phòng Điện tim', 'CLS', 'sp000002-0000-0000-0000-000000000003', 'ECG', '', 1, 'u0000001-0000-0000-0000-000000000001'),
('r0000001-0000-0000-0000-000000000005', 'OP-01', 'Phòng mổ 1', 'OPERATING', NULL, NULL, 'Phòng mổ chính cho ca phẫu thuật đơn giản', 1, 'u0000001-0000-0000-0000-000000000001'),
('r0000001-0000-0000-0000-000000000006', 'AD-01', 'Phòng hành chính', 'ADMIN', NULL, NULL, 'Phòng quản lý và điều hành', 1, 'u0000001-0000-0000-0000-000000000001'),
('r0000003-0000-0000-0000-000000000001', 'PK-03', 'Phòng khám Ngoại', 'EXAMINATION', 'sp000002-0000-0000-0000-000000000004', NULL, NULL, 1, 'u0000001-0000-0000-0000-000000000001'),
('r0000003-0000-0000-0000-000000000002', 'PK-04', 'Phòng khám Tai Mũi Họng', 'EXAMINATION', 'sp000002-0000-0000-0000-000000000001', NULL, NULL, 1, 'u0000001-0000-0000-0000-000000000001'),
('r0000003-0000-0000-0000-000000000003', 'PK-05', 'Phòng khám Sản', 'EXAMINATION', 'sp000002-0000-0000-0000-000000000002', NULL, NULL, 1, 'u0000001-0000-0000-0000-000000000001'),
('r0000003-0000-0000-0000-000000000004', 'PK-06', 'Phòng Thăm dò chức năng', 'EXAMINATION', 'sp000002-0000-0000-0000-000000000003', NULL, NULL, 1, 'u0000001-0000-0000-0000-000000000001'),
('r0000003-0000-0000-0000-000000000005', 'PK-07', 'Phòng khám Mắt', 'EXAMINATION', 'sp000002-0000-0000-0000-000000000005', NULL, NULL, 1, 'u0000001-0000-0000-0000-000000000001'),
('r0000003-0000-0000-0000-000000000006', 'PK-08', 'Phòng khám Răng Hàm Mặt', 'EXAMINATION', 'sp000002-0000-0000-0000-000000000006', NULL, NULL, 1, 'u0000001-0000-0000-0000-000000000001'),
('r0000003-0000-0000-0000-000000000007', 'PK-09', 'Phòng Cấp cứu', 'EXAMINATION', 'sp000001-0000-0000-0000-000000000001', NULL, NULL, 1, 'u0000001-0000-0000-0000-000000000001'),
('r0000003-0000-0000-0000-000000000008', 'PK-10', 'Phòng Nội soi tiêu hóa', 'EXAMINATION', 'sp000001-0000-0000-0000-000000000001', NULL, NULL, 1, 'u0000001-0000-0000-0000-000000000001');

-- =============================================================
-- services
-- =============================================================
-- Full real production set (11 services) — same 2026-08-02 extraction. IDs
-- differ from an earlier fictional placeholder for "Khám Ngoại tổng quát" /
-- "Chụp Xquang" / "Chụp điện tim" (the real ones were created independently
-- during specialty normalization) — this block fully replaces that fixture
-- rather than appending, since services.name is UNIQUE and the names collide.
INSERT IGNORE INTO services (id, service_code, name, specialty_id, type, cls_category, price, description, is_active, created_by) VALUES
('sv000001-0000-0000-0000-000000000001', NULL, 'Khám Nội tổng quát', 'sp000001-0000-0000-0000-000000000001', 'EXAMINATION', NULL, 150000, 'Khám và tư vấn nội khoa tổng quát', 1, 'u0000001-0000-0000-0000-000000000001'),
('sv000002-0000-0000-0000-000000000004', NULL, 'Khám Ngoại tổng quát', 'sp000002-0000-0000-0000-000000000004', 'EXAMINATION', NULL, 150000, NULL, 1, 'u0000001-0000-0000-0000-000000000001'),
('sv000002-0000-0000-0000-000000000001', NULL, 'Khám Tai Mũi Họng', 'sp000002-0000-0000-0000-000000000001', 'EXAMINATION', NULL, 150000, NULL, 1, 'u0000001-0000-0000-0000-000000000001'),
('sv000002-0000-0000-0000-000000000002', NULL, 'Khám Sản phụ khoa', 'sp000002-0000-0000-0000-000000000002', 'EXAMINATION', NULL, 150000, NULL, 1, 'u0000001-0000-0000-0000-000000000001'),
('sv000002-0000-0000-0000-000000000003', NULL, 'Khám Thăm dò chức năng', 'sp000002-0000-0000-0000-000000000003', 'EXAMINATION', NULL, 150000, NULL, 1, 'u0000001-0000-0000-0000-000000000001'),
('sv000002-0000-0000-0000-000000000005', NULL, 'Khám Mắt', 'sp000002-0000-0000-0000-000000000005', 'EXAMINATION', NULL, 150000, NULL, 1, 'u0000001-0000-0000-0000-000000000001'),
('sv000002-0000-0000-0000-000000000006', NULL, 'Khám Răng Hàm Mặt', 'sp000002-0000-0000-0000-000000000006', 'EXAMINATION', NULL, 150000, NULL, 1, 'u0000001-0000-0000-0000-000000000001'),
('sv000001-0000-0000-0000-000000000003', NULL, 'Xét nghiệm', NULL, 'CLS', 'LAB', 250000, 'CBC và sinh hóa máu cơ bản', 1, 'u0000001-0000-0000-0000-000000000001'),
('sv000001-0000-0000-0000-000000000004', NULL, 'Siêu âm', NULL, 'CLS', 'ULTRASOUND', 300000, 'Siêu âm các cơ quan ổ bụng', 1, 'u0000001-0000-0000-0000-000000000001'),
('48f915e9-c86e-4b89-acbd-4ca3b3e34410', NULL, 'Chụp Xquang', NULL, 'CLS', 'XRAY', 200000, NULL, 1, 'u0000001-0000-0000-0000-000000000001'),
('sv000002-0000-0000-0000-000000000007', NULL, 'Chụp điện tim', NULL, 'CLS', 'ECG', 150000, NULL, 1, 'u0000001-0000-0000-0000-000000000001');

-- =============================================================
-- work_schedules
-- =============================================================
INSERT INTO work_schedules (id, user_id, room_id, work_date, shift, created_by) VALUES
('ws000001-0000-0000-0000-000000000001', 'u0000001-0000-0000-0000-000000000003', 'r0000001-0000-0000-0000-000000000001', CURDATE(), 'MORNING',   'u0000001-0000-0000-0000-000000000001'),
('ws000001-0000-0000-0000-000000000002', 'u0000001-0000-0000-0000-000000000003', 'r0000001-0000-0000-0000-000000000001', CURDATE(), 'AFTERNOON', 'u0000001-0000-0000-0000-000000000001'),
('ws000001-0000-0000-0000-000000000003', 'u0000001-0000-0000-0000-000000000004', 'r0000001-0000-0000-0000-000000000002', CURDATE(), 'MORNING',   'u0000001-0000-0000-0000-000000000001'),
('ws000001-0000-0000-0000-000000000004', 'u0000001-0000-0000-0000-000000000006', 'r0000001-0000-0000-0000-000000000003', CURDATE(), 'FULL_DAY',  'u0000001-0000-0000-0000-000000000001');

-- =============================================================
-- patients
-- =============================================================
INSERT INTO patients (id, patient_code, full_name, date_of_birth, gender, phone, id_card, address, notification_consent, created_by) VALUES
('pt000001-0000-0000-0000-000000000001', 'BN-20240101-0001', 'Nguyễn Văn An',    '1985-03-15', 'MALE',   '0912345001', '079085001234', '12 Lê Lợi, Q.1, TP.HCM',       1, 'u0000001-0000-0000-0000-000000000002'),
('pt000001-0000-0000-0000-000000000002', 'BN-20240101-0002', 'Trần Thị Bình',    '1990-07-22', 'FEMALE', '0912345002', '079090002345', '45 Nguyễn Huệ, Q.1, TP.HCM',   1, 'u0000001-0000-0000-0000-000000000002'),
('pt000001-0000-0000-0000-000000000003', 'BN-20240101-0003', 'Lê Minh Cường',    '1978-11-05', 'MALE',   '0912345003', '079078003456', '78 Trần Hưng Đạo, Q.5, TP.HCM', 0, 'u0000001-0000-0000-0000-000000000002'),
('pt000001-0000-0000-0000-000000000004', 'BN-20240101-0004', 'Phạm Thị Dung',    '2015-06-18', 'FEMALE', '0912345004', '079015004321', '23 Cách Mạng Tháng 8, Q.3',     1, 'u0000001-0000-0000-0000-000000000002'),
('pt000001-0000-0000-0000-000000000005', 'BN-20240101-0005', 'Hoàng Văn Em',     '1965-09-30', 'MALE',   '0912345005', '079065005678', '56 Võ Văn Tần, Q.3, TP.HCM',    0, 'u0000001-0000-0000-0000-000000000002'),
('pt000001-0000-0000-0000-000000000010', 'BN-20240618-0010', 'Bùi Thị Minh Anh', '1992-02-14', 'FEMALE', '0912345010', '079092010010', '88 Nguyễn Thị Minh Khai, Q.3, TP.HCM', 1, 'u0000001-0000-0000-0000-000000000009');

-- Liên kết tài khoản tự đăng ký (PATIENT) với hồ sơ bệnh nhân có sẵn theo SĐT (Feature 91)
UPDATE patients SET user_id = 'u0000001-0000-0000-0000-000000000007' WHERE id = 'pt000001-0000-0000-0000-000000000001';
UPDATE patients SET user_id = 'u0000001-0000-0000-0000-000000000010' WHERE id = 'pt000001-0000-0000-0000-000000000010';

-- =============================================================
-- medical_records
-- =============================================================
INSERT INTO medical_records (
    id,
    patient_id,
    medical_history,
    clinical_note,
    diagnosis_summary,
    treatment_summary,
    follow_up_note,
    created_by,
    updated_by
) VALUES
(
    'mr000001-0000-0000-0000-000000000001',
    'pt000001-0000-0000-0000-000000000001',
    'Tăng huyết áp 5 năm, đang dùng Amlodipine 5mg mỗi sáng. Tiền sử viêm dạ dày tái phát, chưa ghi nhận phẫu thuật lớn.',
    'Bệnh nhân tỉnh, tiếp xúc tốt. Mạch 78 lần/phút, huyết áp 130/80 mmHg, nhiệt độ 36.8°C. Đau âm ỉ vùng thượng vị, không nôn, không sốt.',
    'Viêm dạ dày cấp mức độ nhẹ trên nền tiền sử tăng huyết áp đã kiểm soát.',
    'Điều trị nội khoa bằng thuốc ức chế bơm proton, giảm đau khi cần và tư vấn chế độ ăn mềm, hạn chế cà phê, rượu bia, thức ăn cay nóng.',
    'Tái khám sau 14 ngày hoặc sớm hơn nếu đau bụng tăng, nôn ra máu, đi ngoài phân đen, chóng mặt hoặc mệt nhiều.',
    'u0000001-0000-0000-0000-000000000003',
    'u0000001-0000-0000-0000-000000000003'
),
(
    'mr000001-0000-0000-0000-000000000002',
    'pt000001-0000-0000-0000-000000000002',
    'Không ghi nhận bệnh mạn tính. Có tiền sử đau nửa đầu khi căng thẳng, tự hết sau nghỉ ngơi.',
    'Sinh hiệu ổn định. Bệnh nhân than mệt, đau đầu âm ỉ vùng thái dương, không yếu liệt, không nôn ói.',
    'Đau đầu căng cơ, theo dõi thiếu ngủ và stress công việc.',
    'Tư vấn nghỉ ngơi, uống đủ nước, dùng thuốc giảm đau thông thường khi cần và theo dõi triệu chứng thần kinh bất thường.',
    'Tái khám sau 7 ngày nếu đau đầu kéo dài, nhìn mờ, nôn ói hoặc xuất hiện yếu liệt.',
    'u0000001-0000-0000-0000-000000000003',
    'u0000001-0000-0000-0000-000000000003'
),
(
    'mr000001-0000-0000-0000-000000000003',
    'pt000001-0000-0000-0000-000000000003',
    'Tiền sử viêm dạ dày tái phát 2 năm, thường đau tăng khi ăn cay hoặc uống cà phê. Chưa ghi nhận dị ứng thuốc nặng.',
    'Đau thượng vị mức độ vừa, ấn đau vùng thượng vị, không có dấu hiệu xuất huyết tiêu hóa. Sinh hiệu ổn định.',
    'Viêm dạ dày cấp tính, chưa ghi nhận biến chứng. Kết quả xét nghiệm máu trong giới hạn bình thường.',
    'Điều trị nội khoa với Omeprazole, Paracetamol khi đau; hướng dẫn ăn nhẹ, chia nhỏ bữa, tránh rượu bia và thức ăn kích thích.',
    'Tái khám sau 2 tuần để đánh giá đáp ứng điều trị; đi khám ngay nếu đau tăng, nôn ra máu hoặc đi ngoài phân đen.',
    'u0000001-0000-0000-0000-000000000003',
    'u0000001-0000-0000-0000-000000000003'
),
(
    'mr000001-0000-0000-0000-000000000010',
    'pt000001-0000-0000-0000-000000000010',
    'Viêm mũi dị ứng theo mùa 3 năm, thỉnh thoảng tái phát khi thời tiết thay đổi. Không ghi nhận bệnh mạn tính khác.',
    'Bệnh nhân tỉnh, tiếp xúc tốt. Nghẹt mũi, hắt hơi nhiều, đau rát họng nhẹ, phổi thông khí tốt, không khó thở.',
    'Viêm mũi họng cấp trên nền cơ địa dị ứng, chưa ghi nhận dấu hiệu nhiễm khuẩn nặng.',
    'Điều trị triệu chứng, vệ sinh mũi bằng nước muối sinh lý, dùng thuốc kháng histamine buổi tối và uống đủ nước.',
    'Theo dõi 5-7 ngày; tái khám nếu sốt cao, khó thở, đau họng tăng hoặc triệu chứng kéo dài trên 1 tuần.',
    'u0000001-0000-0000-0000-000000000003',
    'u0000001-0000-0000-0000-000000000003'
);

-- =============================================================
-- patient_allergies
-- =============================================================
INSERT INTO patient_allergies (id, patient_id, allergen, severity, description, created_by) VALUES
('pa000001-0000-0000-0000-000000000001', 'pt000001-0000-0000-0000-000000000001', 'Penicillin',  'SEVERE',   'Dị ứng nặng, nổi mề đay toàn thân',   'u0000001-0000-0000-0000-000000000003'),
('pa000001-0000-0000-0000-000000000002', 'pt000001-0000-0000-0000-000000000002', 'Aspirin',     'MODERATE', 'Đau bụng khi dùng Aspirin',             'u0000001-0000-0000-0000-000000000003'),
('pa000001-0000-0000-0000-000000000003', 'pt000001-0000-0000-0000-000000000003', 'Sulfonamide', 'MILD',     'Phát ban nhẹ khi dùng Sulfonamide',     'u0000001-0000-0000-0000-000000000003'),
('pa000001-0000-0000-0000-000000000010', 'pt000001-0000-0000-0000-000000000010', 'Phấn hoa',    'MODERATE', 'Hắt hơi, ngứa mũi và chảy nước mắt khi tiếp xúc nhiều với phấn hoa', 'u0000001-0000-0000-0000-000000000003');

-- =============================================================
-- medicines
-- =============================================================
INSERT INTO medicines (id, name, active_ingredient, dosage_form, unit, price, contraindications, created_by) VALUES
('md000001-0000-0000-0000-000000000001', 'Paracetamol 500mg',  'Paracetamol',       'Viên nén',  'VIEN', 2000,  'Suy gan nặng, dị ứng paracetamol',     'u0000001-0000-0000-0000-000000000001'),
('md000001-0000-0000-0000-000000000002', 'Amoxicillin 500mg',  'Amoxicillin',       'Viên nang', 'VIEN', 5000,  'Dị ứng Penicillin',                     'u0000001-0000-0000-0000-000000000001'),
('md000001-0000-0000-0000-000000000003', 'Ibuprofen 400mg',    'Ibuprofen',         'Viên nén',  'VIEN', 3000,  'Loét dạ dày, suy thận',                 'u0000001-0000-0000-0000-000000000001'),
('md000001-0000-0000-0000-000000000004', 'Omeprazole 20mg',    'Omeprazole',        'Viên nang', 'VIEN', 8000,  'Không dùng chung với Clopidogrel',      'u0000001-0000-0000-0000-000000000001'),
('md000001-0000-0000-0000-000000000005', 'Vitamin C 500mg',    'Ascorbic Acid',     'Viên sủi',  'VIEN', 1500,  NULL,                                    'u0000001-0000-0000-0000-000000000001'),
('md000001-0000-0000-0000-000000000006', 'Metformin 500mg',    'Metformin HCl',     'Viên nén',  'VIEN', 4000,  'Suy thận, suy gan, nhiễm toan lactic',  'u0000001-0000-0000-0000-000000000001'),
('md000001-0000-0000-0000-000000000007', 'Cetirizine 10mg',    'Cetirizine HCl',    'Viên nén',  'VIEN', 3500,  'Mẫn cảm với Hydroxyzine',               'u0000001-0000-0000-0000-000000000001');

-- =============================================================
-- medicine_interactions
-- =============================================================
INSERT INTO medicine_interactions (id, medicine_a_id, medicine_b_id, severity, description, created_by) VALUES
('mi000001-0000-0000-0000-000000000001', 'md000001-0000-0000-0000-000000000003', 'md000001-0000-0000-0000-000000000004', 'MILD',     'Ibuprofen có thể giảm hiệu quả của Omeprazole', 'u0000001-0000-0000-0000-000000000001'),
('mi000001-0000-0000-0000-000000000002', 'md000001-0000-0000-0000-000000000002', 'md000001-0000-0000-0000-000000000006', 'MODERATE', 'Amoxicillin có thể tăng tác dụng của Metformin', 'u0000001-0000-0000-0000-000000000001');

-- =============================================================
-- appointments
-- =============================================================
INSERT INTO appointments (id, patient_id, doctor_id, service_id, room_id, schedule_id, appointment_time, status, booked_by) VALUES
('ap000001-0000-0000-0000-000000000001', 'pt000001-0000-0000-0000-000000000001', 'u0000001-0000-0000-0000-000000000003', 'sv000001-0000-0000-0000-000000000001', 'r0000001-0000-0000-0000-000000000001', 'ws000001-0000-0000-0000-000000000001', DATE_ADD(NOW(), INTERVAL 1 DAY),  'CONFIRMED',  'u0000001-0000-0000-0000-000000000002'),
('ap000001-0000-0000-0000-000000000002', 'pt000001-0000-0000-0000-000000000002', 'u0000001-0000-0000-0000-000000000003', 'sv000001-0000-0000-0000-000000000001', 'r0000001-0000-0000-0000-000000000001', 'ws000001-0000-0000-0000-000000000001', DATE_ADD(NOW(), INTERVAL 1 DAY),  'PENDING',    'u0000001-0000-0000-0000-000000000002'),
('ap000001-0000-0000-0000-000000000003', 'pt000001-0000-0000-0000-000000000004', 'u0000001-0000-0000-0000-000000000004', 'sv000001-0000-0000-0000-000000000001', 'r0000001-0000-0000-0000-000000000002', 'ws000001-0000-0000-0000-000000000003', DATE_ADD(NOW(), INTERVAL 1 DAY),  'CONFIRMED',  'u0000001-0000-0000-0000-000000000002'),
('ap000001-0000-0000-0000-000000000004', 'pt000001-0000-0000-0000-000000000003', 'u0000001-0000-0000-0000-000000000003', 'sv000001-0000-0000-0000-000000000001', 'r0000001-0000-0000-0000-000000000001', 'ws000001-0000-0000-0000-000000000002', DATE_SUB(NOW(), INTERVAL 1 DAY),  'COMPLETED',  'u0000001-0000-0000-0000-000000000002'),
('ap000001-0000-0000-0000-000000000005', 'pt000001-0000-0000-0000-000000000005', 'u0000001-0000-0000-0000-000000000003', 'sv000001-0000-0000-0000-000000000001', NULL,                                  NULL,                                  DATE_ADD(NOW(), INTERVAL 3 DAY),  'PENDING',  'u0000001-0000-0000-0000-000000000002'),
('ap000001-0000-0000-0000-000000000010', 'pt000001-0000-0000-0000-000000000010', 'u0000001-0000-0000-0000-000000000003', 'sv000001-0000-0000-0000-000000000001', 'r0000001-0000-0000-0000-000000000001', 'ws000001-0000-0000-0000-000000000002', DATE_SUB(NOW(), INTERVAL 3 DAY), 'COMPLETED', 'u0000001-0000-0000-0000-000000000009');

-- INSERT above uses PENDING, not CANCELLED: inserting CANCELLED directly
-- violates chk_appt_cancel (requires cancel_reason/cancelled_by/cancelled_at
-- to be set), which this UPDATE only sets afterward. Transition the status
-- here, atomically with the other cancel fields.
UPDATE appointments
SET status        = 'CANCELLED',
    cancel_reason = 'Bệnh nhân bận công việc đột xuất',
    cancelled_by  = 'u0000001-0000-0000-0000-000000000002',
    cancelled_at  = NOW()
WHERE id = 'ap000001-0000-0000-0000-000000000005';

-- =============================================================
-- appointment_history
-- =============================================================
INSERT INTO appointment_history (id, appointment_id, old_status, new_status, changed_by) VALUES
('ah000001-0000-0000-0000-000000000001', 'ap000001-0000-0000-0000-000000000001', NULL,        'PENDING',   'u0000001-0000-0000-0000-000000000002'),
('ah000001-0000-0000-0000-000000000002', 'ap000001-0000-0000-0000-000000000001', 'PENDING',   'CONFIRMED', 'u0000001-0000-0000-0000-000000000002'),
('ah000001-0000-0000-0000-000000000003', 'ap000001-0000-0000-0000-000000000004', NULL,        'PENDING',   'u0000001-0000-0000-0000-000000000002'),
('ah000001-0000-0000-0000-000000000004', 'ap000001-0000-0000-0000-000000000004', 'PENDING',   'CONFIRMED', 'u0000001-0000-0000-0000-000000000002'),
('ah000001-0000-0000-0000-000000000005', 'ap000001-0000-0000-0000-000000000004', 'CONFIRMED', 'CHECKED_IN','u0000001-0000-0000-0000-000000000002'),
('ah000001-0000-0000-0000-000000000006', 'ap000001-0000-0000-0000-000000000004', 'CHECKED_IN','COMPLETED', 'u0000001-0000-0000-0000-000000000003'),
('ah000001-0000-0000-0000-000000000010', 'ap000001-0000-0000-0000-000000000010', NULL,        'PENDING',   'u0000001-0000-0000-0000-000000000009'),
('ah000001-0000-0000-0000-000000000011', 'ap000001-0000-0000-0000-000000000010', 'PENDING',   'CONFIRMED', 'u0000001-0000-0000-0000-000000000009'),
('ah000001-0000-0000-0000-000000000012', 'ap000001-0000-0000-0000-000000000010', 'CONFIRMED', 'CHECKED_IN','u0000001-0000-0000-0000-000000000009'),
('ah000001-0000-0000-0000-000000000013', 'ap000001-0000-0000-0000-000000000010', 'CHECKED_IN','COMPLETED', 'u0000001-0000-0000-0000-000000000003');

-- =============================================================
-- visits (từ appointment COMPLETED)
-- =============================================================
INSERT INTO visits (id, appointment_id, patient_id, doctor_id, room_id, queue_number, status, called_at, started_at, completed_at) VALUES
('vi000001-0000-0000-0000-000000000001', 'ap000001-0000-0000-0000-000000000004', 'pt000001-0000-0000-0000-000000000003', 'u0000001-0000-0000-0000-000000000003', 'r0000001-0000-0000-0000-000000000001', 'PK01-001', 'COMPLETED',
 DATE_SUB(NOW(), INTERVAL 23 HOUR),
 DATE_SUB(NOW(), INTERVAL 22 HOUR),
 DATE_SUB(NOW(), INTERVAL 21 HOUR)),
('vi000001-0000-0000-0000-000000000010', 'ap000001-0000-0000-0000-000000000010', 'pt000001-0000-0000-0000-000000000010', 'u0000001-0000-0000-0000-000000000003', 'r0000001-0000-0000-0000-000000000001', 'PK01-002', 'COMPLETED',
 DATE_SUB(NOW(), INTERVAL 3 DAY),
 DATE_ADD(DATE_SUB(NOW(), INTERVAL 3 DAY), INTERVAL 20 MINUTE),
 DATE_ADD(DATE_SUB(NOW(), INTERVAL 3 DAY), INTERVAL 55 MINUTE));

-- =============================================================
-- examination_results
-- =============================================================
INSERT INTO examination_results (id, visit_id, diagnosis, clinical_note, treatment_result, follow_up_date, access_code, access_code_expires_at, created_by) VALUES
('er000001-0000-0000-0000-000000000001', 'vi000001-0000-0000-0000-000000000001',
 'Viêm dạ dày cấp tính',
 'Bệnh nhân đau thượng vị, buồn nôn. Ấn đau vùng thượng vị. Không có dấu hiệu xuất huyết tiêu hóa.',
 'Điều trị nội khoa, uống thuốc đều đặn, ăn nhẹ, tránh thức ăn cay nóng.',
 DATE_ADD(CURDATE(), INTERVAL 14 DAY),
 'KQ-LC-001234',
 DATE_ADD(NOW(), INTERVAL 30 DAY),
 'u0000001-0000-0000-0000-000000000003'),
('er000001-0000-0000-0000-000000000010', 'vi000001-0000-0000-0000-000000000010',
 'Viêm mũi họng cấp trên nền cơ địa dị ứng',
 'Niêm mạc mũi sung huyết nhẹ, họng đỏ nhẹ, không giả mạc. Phổi thông khí đều, không ran. Sinh hiệu ổn định.',
 'Điều trị triệu chứng, vệ sinh mũi bằng nước muối sinh lý, dùng kháng histamine buổi tối và theo dõi tại nhà.',
 DATE_ADD(CURDATE(), INTERVAL 7 DAY),
 'KQ-LC-001010',
 DATE_ADD(NOW(), INTERVAL 30 DAY),
 'u0000001-0000-0000-0000-000000000003');

-- =============================================================
-- cls_orders
-- =============================================================
INSERT INTO cls_orders (id, visit_id, cls_room_id, service_id, note, status, created_by) VALUES
('co000001-0000-0000-0000-000000000001', 'vi000001-0000-0000-0000-000000000001', 'r0000001-0000-0000-0000-000000000003', 'sv000001-0000-0000-0000-000000000003', 'Kiểm tra công thức máu và sinh hóa cơ bản', 'COMPLETED', 'u0000001-0000-0000-0000-000000000003'),
('co000001-0000-0000-0000-000000000010', 'vi000001-0000-0000-0000-000000000010', 'r0000001-0000-0000-0000-000000000003', 'sv000001-0000-0000-0000-000000000003', 'Công thức máu để loại trừ nhiễm khuẩn cấp', 'COMPLETED', 'u0000001-0000-0000-0000-000000000003');

-- =============================================================
-- cls_results
-- =============================================================
INSERT INTO cls_results (id, cls_order_id, result_data, summary, created_by) VALUES
('cr000001-0000-0000-0000-000000000001', 'co000001-0000-0000-0000-000000000001',
 '{"WBC": 8.5, "RBC": 4.8, "HGB": 14.2, "HCT": 42.1, "PLT": 250, "glucose": 5.2, "creatinine": 85, "ALT": 32, "AST": 28}',
 'Kết quả trong giới hạn bình thường. Không phát hiện bất thường đáng kể.',
 'u0000001-0000-0000-0000-000000000006'),
('cr000001-0000-0000-0000-000000000010', 'co000001-0000-0000-0000-000000000010',
 '{"WBC": 7.2, "RBC": 4.5, "HGB": 13.1, "HCT": 39.8, "PLT": 275, "NEU_percent": 58, "LYM_percent": 34}',
 'Công thức máu trong giới hạn bình thường, chưa gợi ý nhiễm khuẩn cấp.',
 'u0000001-0000-0000-0000-000000000006');

-- =============================================================
-- prescriptions
-- =============================================================
INSERT INTO prescriptions (id, visit_id, note, created_by) VALUES
('pr000001-0000-0000-0000-000000000001', 'vi000001-0000-0000-0000-000000000001', 'Uống thuốc đúng giờ, sau bữa ăn. Tái khám sau 2 tuần nếu không thuyên giảm.', 'u0000001-0000-0000-0000-000000000003'),
('pr000001-0000-0000-0000-000000000010', 'vi000001-0000-0000-0000-000000000010', 'Uống thuốc theo hướng dẫn, rửa mũi mỗi ngày và tránh bụi/phấn hoa trong thời gian điều trị.', 'u0000001-0000-0000-0000-000000000003');

-- =============================================================
-- prescription_items
-- =============================================================
INSERT INTO prescription_items (id, prescription_id, medicine_id, dosage, frequency, duration_days, instruction, sort_order) VALUES
('pi000001-0000-0000-0000-000000000001', 'pr000001-0000-0000-0000-000000000001', 'md000001-0000-0000-0000-000000000004', '20mg', '1 lần/ngày', 14, 'Uống trước ăn 30 phút, buổi sáng', 1),
('pi000001-0000-0000-0000-000000000002', 'pr000001-0000-0000-0000-000000000001', 'md000001-0000-0000-0000-000000000001', '500mg','3 lần/ngày', 5,  'Uống sau ăn khi đau', 2),
('pi000001-0000-0000-0000-000000000010', 'pr000001-0000-0000-0000-000000000010', 'md000001-0000-0000-0000-000000000007', '10mg', '1 lần/ngày', 7, 'Uống buổi tối sau ăn, tránh lái xe nếu buồn ngủ', 1),
('pi000001-0000-0000-0000-000000000011', 'pr000001-0000-0000-0000-000000000010', 'md000001-0000-0000-0000-000000000005', '500mg', '1 lần/ngày', 7, 'Uống sau ăn sáng', 2);

-- =============================================================
-- invoices
-- =============================================================
INSERT INTO invoices (id, appointment_id, patient_id, invoice_code, subtotal, discount, total, amount_due, payment_status, payment_method, paid_at, created_by) VALUES
('inv00001-0000-0000-0000-000000000001', 'ap000001-0000-0000-0000-000000000004', 'pt000001-0000-0000-0000-000000000003',
 'INV-20240101-0001', 650000, 0, 650000, 650000, 'PAID', 'CASH', DATE_SUB(NOW(), INTERVAL 20 HOUR), 'u0000001-0000-0000-0000-000000000002');

-- =============================================================
-- invoice_items
-- =============================================================
INSERT INTO invoice_items (id, invoice_id, item_type, service_ref_id, cls_ref_id, medicine_ref_id, name, unit_price, quantity, amount) VALUES
('ii000001-0000-0000-0000-000000000001', 'inv00001-0000-0000-0000-000000000001', 'SERVICE', 'sv000001-0000-0000-0000-000000000001', NULL, NULL, 'Khám Nội tổng quát',     150000, 1, 150000),
('ii000001-0000-0000-0000-000000000002', 'inv00001-0000-0000-0000-000000000001', 'CLS',     NULL, 'co000001-0000-0000-0000-000000000001', NULL, 'Xét nghiệm máu toàn bộ', 250000, 1, 250000),
('ii000001-0000-0000-0000-000000000003', 'inv00001-0000-0000-0000-000000000001', 'MEDICINE',NULL, NULL, 'pi000001-0000-0000-0000-000000000001',        'Omeprazole 20mg',        8000,  14, 112000),
('ii000001-0000-0000-0000-000000000004', 'inv00001-0000-0000-0000-000000000001', 'MEDICINE',NULL, NULL, 'pi000001-0000-0000-0000-000000000002',        'Paracetamol 500mg',      2000,  15, 30000);

-- Kiểm tra tổng: 150000 + 250000 + 112000 + 30000 = 542000 != 650000
-- Cần update subtotal/total/amount_due cho đúng (amount_due = total)
UPDATE invoices SET subtotal = 542000, total = 542000, amount_due = 542000
WHERE id = 'inv00001-0000-0000-0000-000000000001';

-- =============================================================
-- supply_categories
-- =============================================================
INSERT INTO supply_categories (id, name, description, created_by) VALUES
('sc000001-0000-0000-0000-000000000001', 'Vật tư tiêu hao',   'Kim tiêm, bông, gạc, găng tay...', 'u0000001-0000-0000-0000-000000000001'),
('sc000001-0000-0000-0000-000000000002', 'Thiết bị y tế',     'Máy đo huyết áp, nhiệt kế...',     'u0000001-0000-0000-0000-000000000001'),
('sc000001-0000-0000-0000-000000000003', 'Hóa chất xét nghiệm','Reagent, hóa chất phân tích...',   'u0000001-0000-0000-0000-000000000001');

-- =============================================================
-- suppliers
-- =============================================================
INSERT INTO suppliers (id, name, phone, email, address, created_by) VALUES
('sup00001-0000-0000-0000-000000000001', 'Công ty TNHH Medipharco',    '02838001234', 'order@medipharco.vn',  '123 Điện Biên Phủ, Q.Bình Thạnh, TP.HCM', 'u0000001-0000-0000-0000-000000000001'),
('sup00001-0000-0000-0000-000000000002', 'Công ty CP Thiết Bị Y Tế VN','02839005678', 'sales@meddevice.vn',   '456 Hoàng Văn Thụ, Q.Phú Nhuận, TP.HCM',  'u0000001-0000-0000-0000-000000000001');

-- =============================================================
-- supplies
-- =============================================================
INSERT INTO supplies (id, category_id, name, unit, current_stock, min_stock_level, created_by) VALUES
('sy000001-0000-0000-0000-000000000001', 'sc000001-0000-0000-0000-000000000001', 'Kim tiêm 5ml',       'CAI',  500, 100, 'u0000001-0000-0000-0000-000000000001'),
('sy000001-0000-0000-0000-000000000002', 'sc000001-0000-0000-0000-000000000001', 'Găng tay cao su M',  'KHAC', 300, 50,  'u0000001-0000-0000-0000-000000000001'),
('sy000001-0000-0000-0000-000000000003', 'sc000001-0000-0000-0000-000000000001', 'Gạc vô trùng 10x10', 'KHAC', 1000,200, 'u0000001-0000-0000-0000-000000000001'),
('sy000001-0000-0000-0000-000000000004', 'sc000001-0000-0000-0000-000000000003', 'Reagent CBC',        'BO',   20,  5,   'u0000001-0000-0000-0000-000000000001');

-- =============================================================
-- supply_imports
-- =============================================================
INSERT INTO supply_imports (id, supplier_id, import_date, total_value, note, created_by) VALUES
('si000001-0000-0000-0000-000000000001', 'sup00001-0000-0000-0000-000000000001', CURDATE(), 15000000, 'Nhập vật tư tháng này', 'u0000001-0000-0000-0000-000000000001');

-- =============================================================
-- supply_import_items
-- =============================================================
INSERT INTO supply_import_items (id, import_id, supply_id, quantity, unit_price, expiry_date) VALUES
('sii00001-0000-0000-0000-000000000001', 'si000001-0000-0000-0000-000000000001', 'sy000001-0000-0000-0000-000000000001', 500, 5000,  DATE_ADD(CURDATE(), INTERVAL 2 YEAR)),
('sii00001-0000-0000-0000-000000000002', 'si000001-0000-0000-0000-000000000001', 'sy000001-0000-0000-0000-000000000002', 300, 8000,  DATE_ADD(CURDATE(), INTERVAL 1 YEAR)),
('sii00001-0000-0000-0000-000000000003', 'si000001-0000-0000-0000-000000000001', 'sy000001-0000-0000-0000-000000000003', 1000,2000,  DATE_ADD(CURDATE(), INTERVAL 3 YEAR));

-- =============================================================
-- supply_transactions (IMPORT — trigger sẽ update current_stock)
-- =============================================================
INSERT INTO supply_transactions (id, supply_id, transaction_type, quantity, import_id, created_by) VALUES
('st000001-0000-0000-0000-000000000001', 'sy000001-0000-0000-0000-000000000001', 'IMPORT', 500, 'si000001-0000-0000-0000-000000000001', 'u0000001-0000-0000-0000-000000000001'),
('st000001-0000-0000-0000-000000000002', 'sy000001-0000-0000-0000-000000000002', 'IMPORT', 300, 'si000001-0000-0000-0000-000000000001', 'u0000001-0000-0000-0000-000000000001'),
('st000001-0000-0000-0000-000000000003', 'sy000001-0000-0000-0000-000000000003', 'IMPORT', 1000,'si000001-0000-0000-0000-000000000001', 'u0000001-0000-0000-0000-000000000001');

-- DISTRIBUTE to room
INSERT INTO supply_transactions (id, supply_id, transaction_type, quantity, room_id, note, created_by) VALUES
('st000001-0000-0000-0000-000000000004', 'sy000001-0000-0000-0000-000000000001', 'DISTRIBUTE', -50, 'r0000001-0000-0000-0000-000000000001', 'Cấp phát cho phòng PK-01', 'u0000001-0000-0000-0000-000000000001'),
('st000001-0000-0000-0000-000000000005', 'sy000001-0000-0000-0000-000000000002', 'DISTRIBUTE', -20, 'r0000001-0000-0000-0000-000000000001', 'Cấp phát cho phòng PK-01', 'u0000001-0000-0000-0000-000000000001');

-- =============================================================
-- notification_logs
-- =============================================================
INSERT INTO notification_logs (id, user_id, recipient, channel, type, subject, body, status, sent_at) VALUES
('nl000001-0000-0000-0000-000000000001', 'u0000001-0000-0000-0000-000000000002', 'reception@gmail.com', 'EMAIL', 'TEMP_PASSWORD',
 'Tài khoản hệ thống Clinic',
 'Xin chào, tài khoản của bạn đã được tạo. Mật khẩu tạm thời: TempPass@123',
 'SENT', DATE_SUB(NOW(), INTERVAL 7 DAY)),
('nl000001-0000-0000-0000-000000000002', NULL, '0912345001', 'SMS', 'APPOINTMENT_CONFIRMED',
 NULL,
 'Lich hen cua ban ngay mai luc 08:00 da duoc xac nhan. Ma lich hen: AP-001.',
 'SENT', DATE_SUB(NOW(), INTERVAL 1 DAY));

-- =============================================================
-- system_logs
-- =============================================================
INSERT INTO system_logs (id, user_id, action, module, target_id, detail, ip_address) VALUES
('sl000001-0000-0000-0000-000000000001', 'u0000001-0000-0000-0000-000000000001', 'LOGIN',  'USER',        NULL,                                          '{"device": "Chrome/Windows"}', '127.0.0.1'),
('sl000001-0000-0000-0000-000000000002', 'u0000001-0000-0000-0000-000000000001', 'CREATE', 'USER',        'u0000001-0000-0000-0000-000000000002',         '{"role": "RECEPTIONIST"}',    '127.0.0.1'),
('sl000001-0000-0000-0000-000000000003', 'u0000001-0000-0000-0000-000000000002', 'LOGIN',  'USER',        NULL,                                          '{"device": "Firefox/MacOS"}',  '192.168.1.10'),
('sl000001-0000-0000-0000-000000000004', 'u0000001-0000-0000-0000-000000000002', 'CREATE', 'PATIENT',     'pt000001-0000-0000-0000-000000000001',         '{"patient_code": "BN-20240101-0001"}', '192.168.1.10'),
('sl000001-0000-0000-0000-000000000005', 'u0000001-0000-0000-0000-000000000003', 'CREATE', 'VISIT',       'vi000001-0000-0000-0000-000000000001',         '{"appointment_id": "ap000001-0000-0000-0000-000000000004"}', '192.168.1.20'),
('sl000001-0000-0000-0000-000000000006', 'u0000001-0000-0000-0000-000000000002', 'UPDATE', 'APPOINTMENT', 'ap000001-0000-0000-0000-000000000005',         '{"field": "status", "old": "PENDING", "new": "CANCELLED"}', '192.168.1.10');

-- =============================================================
-- REAL PRODUCTION DATA BACKUP (extracted 2026-08-02)
-- =============================================================
-- The clinic's actual staff roster, medicine/supply catalog, and their
-- specialty/room assignments — captured from clinic-system-db right before
-- that RDS instance was deleted (AWS free tier had run out, avoiding
-- ongoing cost). This is real data (real names, real license numbers from
-- the clinic's professional-practice certificate list), not a dev fixture
-- — kept here, clearly separated from the synthetic fixtures above, so a
-- future restore of the RDS instance can reproduce the actual production
-- state from this file alone (see rooms/services above too — those blocks
-- were already updated in place to the real 16-room/11-service set).
-- Login password for every account below is 'Staff@123' (the system's
-- standard admin-created-staff temp password, must_change_password=1).

-- users: 23 real staff (16 doctors, 4 lab techs, 3 nurses)
INSERT IGNORE INTO users (id, full_name, email, phone, password_hash, id_card, role, specialty_id, is_active, must_change_password) VALUES
('u0000002-0000-0000-0000-000000000001', 'Bùi Minh Tiến', 'buiminhtien@aucophuha.vn', '0900001001', '$2b$10$hogmXNPVe7stz5N4hZJl3euIyaEEhnPTl9hwkOUn6lTN4XEqPoOvK', NULL, 'DOCTOR', 'sp000001-0000-0000-0000-000000000001', 1, 1),
('u0000002-0000-0000-0000-000000000017', 'Bùi Thị Thu Ngân', 'buithithungan@aucophuha.vn', '0900001017', '$2b$10$hogmXNPVe7stz5N4hZJl3euIyaEEhnPTl9hwkOUn6lTN4XEqPoOvK', NULL, 'DOCTOR', 'sp000001-0000-0000-0000-000000000001', 1, 1),
('u0000002-0000-0000-0000-000000000022', 'Đinh Thị Ngân', 'dinhthingan@aucophuha.vn', '0900001022', '$2b$10$hogmXNPVe7stz5N4hZJl3euIyaEEhnPTl9hwkOUn6lTN4XEqPoOvK', NULL, 'NURSE', 'sp000002-0000-0000-0000-000000000002', 1, 1),
('u0000002-0000-0000-0000-000000000006', 'Đỗ Quang Thúy', 'doquangthuy@aucophuha.vn', '0900001006', '$2b$10$hogmXNPVe7stz5N4hZJl3euIyaEEhnPTl9hwkOUn6lTN4XEqPoOvK', NULL, 'DOCTOR', 'sp000002-0000-0000-0000-000000000001', 1, 1),
('u0000002-0000-0000-0000-000000000008', 'Đoàn Hồng Minh', 'doanhongminh@aucophuha.vn', '0900001008', '$2b$10$hogmXNPVe7stz5N4hZJl3euIyaEEhnPTl9hwkOUn6lTN4XEqPoOvK', NULL, 'DOCTOR', 'sp000002-0000-0000-0000-000000000002', 1, 1),
('u0000002-0000-0000-0000-000000000010', 'Hà Văn Lực', 'havanluc@aucophuha.vn', '0900001010', '$2b$10$hogmXNPVe7stz5N4hZJl3euIyaEEhnPTl9hwkOUn6lTN4XEqPoOvK', NULL, 'DOCTOR', 'sp000001-0000-0000-0000-000000000001', 1, 1),
('u0000002-0000-0000-0000-000000000009', 'Khuất Hữu Thanh', 'khuathuuthanh@aucophuha.vn', '0900001009', '$2b$10$hogmXNPVe7stz5N4hZJl3euIyaEEhnPTl9hwkOUn6lTN4XEqPoOvK', NULL, 'DOCTOR', 'sp000003-0000-0000-0000-000000000001', 1, 1),
('u0000002-0000-0000-0000-000000000002', 'Lê Hữu Toàn', 'lehuutoan@aucophuha.vn', '0900001002', '$2b$10$hogmXNPVe7stz5N4hZJl3euIyaEEhnPTl9hwkOUn6lTN4XEqPoOvK', NULL, 'DOCTOR', 'sp000001-0000-0000-0000-000000000001', 1, 1),
('u0000002-0000-0000-0000-000000000012', 'Lê Thị Lộc', 'lethiloc@aucophuha.vn', '0900001012', '$2b$10$hogmXNPVe7stz5N4hZJl3euIyaEEhnPTl9hwkOUn6lTN4XEqPoOvK', NULL, 'DOCTOR', 'sp000003-0000-0000-0000-000000000001', 1, 1),
('u0000002-0000-0000-0000-000000000011', 'Lê Thị Minh Ngọc', 'lethiminhngoc@aucophuha.vn', '0900001011', '$2b$10$hogmXNPVe7stz5N4hZJl3euIyaEEhnPTl9hwkOUn6lTN4XEqPoOvK', NULL, 'DOCTOR', 'sp000001-0000-0000-0000-000000000001', 1, 1),
('u0000002-0000-0000-0000-000000000013', 'Lê Thị Thanh Thể', 'lethithanhthe@aucophuha.vn', '0900001013', '$2b$10$hogmXNPVe7stz5N4hZJl3euIyaEEhnPTl9hwkOUn6lTN4XEqPoOvK', NULL, 'LAB_TECH', 'sp000003-0000-0000-0000-000000000002', 1, 1),
('u0000002-0000-0000-0000-000000000016', 'Ngô Tiến Đạt', 'ngotiendat@aucophuha.vn', '0900001016', '$2b$10$hogmXNPVe7stz5N4hZJl3euIyaEEhnPTl9hwkOUn6lTN4XEqPoOvK', NULL, 'LAB_TECH', 'sp000003-0000-0000-0000-000000000001', 1, 1),
('u0000002-0000-0000-0000-000000000020', 'Nguyễn Khánh Huyền', 'nguyenkhanhhuyen@aucophuha.vn', '0900001020', '$2b$10$hogmXNPVe7stz5N4hZJl3euIyaEEhnPTl9hwkOUn6lTN4XEqPoOvK', NULL, 'LAB_TECH', 'sp000003-0000-0000-0000-000000000002', 1, 1),
('u0000002-0000-0000-0000-000000000023', 'Nguyễn Quang Huy', 'nguyenquanghuy@aucophuha.vn', '0900001023', '$2b$10$hogmXNPVe7stz5N4hZJl3euIyaEEhnPTl9hwkOUn6lTN4XEqPoOvK', NULL, 'DOCTOR', 'sp000002-0000-0000-0000-000000000004', 1, 1),
('u0000002-0000-0000-0000-000000000014', 'Nguyễn Thị Duyên', 'nguyenthiduyen@aucophuha.vn', '0900001014', '$2b$10$hogmXNPVe7stz5N4hZJl3euIyaEEhnPTl9hwkOUn6lTN4XEqPoOvK', NULL, 'DOCTOR', 'sp000001-0000-0000-0000-000000000001', 1, 1),
('u0000002-0000-0000-0000-000000000021', 'Nguyễn Thị Hương Thảo', 'nguyenthihuongthao@aucophuha.vn', '0900001021', '$2b$10$hogmXNPVe7stz5N4hZJl3euIyaEEhnPTl9hwkOUn6lTN4XEqPoOvK', NULL, 'NURSE', 'sp000001-0000-0000-0000-000000000001', 1, 1),
('u0000002-0000-0000-0000-000000000018', 'Nguyễn Trọng Hiếu', 'nguyentronghieu@aucophuha.vn', '0900001018', '$2b$10$hogmXNPVe7stz5N4hZJl3euIyaEEhnPTl9hwkOUn6lTN4XEqPoOvK', NULL, 'DOCTOR', 'sp000001-0000-0000-0000-000000000001', 1, 1),
('u0000002-0000-0000-0000-000000000007', 'Phan Thị Chinh', 'phanthichinh@aucophuha.vn', '0900001007', '$2b$10$hogmXNPVe7stz5N4hZJl3euIyaEEhnPTl9hwkOUn6lTN4XEqPoOvK', NULL, 'DOCTOR', 'sp000002-0000-0000-0000-000000000005', 1, 1),
('u0000002-0000-0000-0000-000000000003', 'Phùng Đức Thành', 'phungducthanh@aucophuha.vn', '0900001003', '$2b$10$hogmXNPVe7stz5N4hZJl3euIyaEEhnPTl9hwkOUn6lTN4XEqPoOvK', NULL, 'DOCTOR', 'sp000002-0000-0000-0000-000000000004', 1, 1),
('u0000002-0000-0000-0000-000000000015', 'Tống Anh Tuấn', 'tonganhtuan@aucophuha.vn', '0900001015', '$2b$10$hogmXNPVe7stz5N4hZJl3euIyaEEhnPTl9hwkOUn6lTN4XEqPoOvK', NULL, 'LAB_TECH', 'sp000003-0000-0000-0000-000000000001', 1, 1),
('u0000002-0000-0000-0000-000000000004', 'Trần Thị Liêm', 'tranthiliem@aucophuha.vn', '0900001004', '$2b$10$hogmXNPVe7stz5N4hZJl3euIyaEEhnPTl9hwkOUn6lTN4XEqPoOvK', NULL, 'DOCTOR', 'sp000001-0000-0000-0000-000000000001', 1, 1),
('u0000002-0000-0000-0000-000000000019', 'Trần Thị Tú Linh', 'tranthitulinh@aucophuha.vn', '0900001019', '$2b$10$hogmXNPVe7stz5N4hZJl3euIyaEEhnPTl9hwkOUn6lTN4XEqPoOvK', NULL, 'NURSE', 'sp000001-0000-0000-0000-000000000001', 1, 1),
('u0000002-0000-0000-0000-000000000005', 'Từ Thị Hoa', 'tuthihoa@aucophuha.vn', '0900001005', '$2b$10$hogmXNPVe7stz5N4hZJl3euIyaEEhnPTl9hwkOUn6lTN4XEqPoOvK', NULL, 'DOCTOR', 'sp000001-0000-0000-0000-000000000001', 1, 1);

-- doctor_profiles: 16 real doctors (certification = số CCHN từ danh sách hành nghề)
INSERT IGNORE INTO doctor_profiles (id, user_id, specialty_id, subspecialty, degree, certification, years_experience, biography) VALUES
('dp000002-0000-0000-0000-000000000001', 'u0000002-0000-0000-0000-000000000001', 'sp000001-0000-0000-0000-000000000001', 'Khám bệnh, chữa bệnh đa khoa', 'Bác sĩ', 'Số CCHN: 000169/PT-CCHN', NULL, 'Trưởng phòng khám.'),
('dp000002-0000-0000-0000-000000000002', 'u0000002-0000-0000-0000-000000000002', 'sp000001-0000-0000-0000-000000000001', 'Khám bệnh, chữa bệnh Nội khoa', 'Bác sĩ CKI', 'Số CCHN: 001761/PT-CCHN', NULL, 'Phụ trách Phòng Nội.'),
('dp000002-0000-0000-0000-000000000003', 'u0000002-0000-0000-0000-000000000003', 'sp000002-0000-0000-0000-000000000004', 'Khám, chữa bệnh CK Ngoại', 'Bác sĩ CKI', 'Số CCHN: 000168/PT-CCHN', NULL, 'Phụ trách Phòng Ngoại.'),
('dp000002-0000-0000-0000-000000000004', 'u0000002-0000-0000-0000-000000000004', 'sp000001-0000-0000-0000-000000000001', 'Khám, chữa bệnh đa khoa', 'Thạc sĩ Y học', 'Số CCHN: 000909/PT-CCHN', NULL, 'Phụ trách Phòng Nội.'),
('dp000002-0000-0000-0000-000000000005', 'u0000002-0000-0000-0000-000000000005', 'sp000001-0000-0000-0000-000000000001', 'Khám bệnh, chữa bệnh đa khoa', 'Bác sĩ CKI', 'Số CCHN: 0002690/PT-CCHN', NULL, 'Phụ trách Phòng Nội.'),
('dp000002-0000-0000-0000-000000000006', 'u0000002-0000-0000-0000-000000000006', 'sp000002-0000-0000-0000-000000000001', 'Khám bệnh, chữa bệnh CK Tai Mũi Họng', 'Bác sĩ CKI', 'Số CCHN: 000862/PT-CCHN', NULL, 'Phụ trách Phòng Tai Mũi Họng.'),
('dp000002-0000-0000-0000-000000000007', 'u0000002-0000-0000-0000-000000000007', 'sp000002-0000-0000-0000-000000000005', 'Khám bệnh, chữa bệnh chuyên ngành Nhãn khoa', 'Bác sĩ CKI', 'Số CCHN: 0002504/PT-CCHN', NULL, 'Phụ trách Phòng Mắt.'),
('dp000002-0000-0000-0000-000000000008', 'u0000002-0000-0000-0000-000000000008', 'sp000002-0000-0000-0000-000000000002', 'Khám bệnh, chữa bệnh chuyên khoa Sản phụ khoa', 'Bác sĩ', 'Số CCHN: 002154/PT-CCHN', NULL, 'Phụ trách Phòng Sản.'),
('dp000002-0000-0000-0000-000000000009', 'u0000002-0000-0000-0000-000000000009', 'sp000003-0000-0000-0000-000000000001', 'Chuyên khoa chẩn đoán hình ảnh', 'Bác sĩ CKI', 'Số CCHN: 0028226/BYT-CCHN', NULL, 'Phụ trách Chẩn đoán hình ảnh.'),
('dp000002-0000-0000-0000-000000000010', 'u0000002-0000-0000-0000-000000000010', 'sp000001-0000-0000-0000-000000000001', 'Khám bệnh, chữa bệnh đa khoa', 'Bác sĩ', 'Số CCHN: 0001985/LCH-CCHN', NULL, 'Phụ trách phòng Nội soi tiêu hóa.'),
('dp000002-0000-0000-0000-000000000011', 'u0000002-0000-0000-0000-000000000011', 'sp000001-0000-0000-0000-000000000001', 'Khám bệnh, chữa bệnh đa khoa', 'Bác sĩ CKI', 'Số CCHN: 0004881/PT-CCHN', NULL, 'Làm việc bán thời gian tại phòng khám: Thứ 7, Chủ nhật 07:00-17:30 (đăng ký hành nghề tại cơ sở khác các ngày trong tuần, 07:00-17:00 T2-T6).'),
('dp000002-0000-0000-0000-000000000012', 'u0000002-0000-0000-0000-000000000012', 'sp000003-0000-0000-0000-000000000001', 'Khám bệnh, chữa bệnh đa khoa; Thực hiện kỹ thuật siêu âm tổng quát; Khám, chữa bệnh chuyên khoa Chẩn đoán hình ảnh', 'Bác sĩ', 'Số CCHN: 0005195/PT-CCHN', NULL, NULL),
('dp000002-0000-0000-0000-000000000013', 'u0000002-0000-0000-0000-000000000014', 'sp000001-0000-0000-0000-000000000001', 'Khám bệnh, chữa bệnh đa khoa', 'Bác sĩ', 'Số CCHN: 0007688/PT-CCHN', NULL, 'Phụ trách phòng Cấp cứu.'),
('dp000002-0000-0000-0000-000000000014', 'u0000002-0000-0000-0000-000000000017', 'sp000001-0000-0000-0000-000000000001', 'Phát hiện và xử trí các bệnh thông thường, xử trí ban đầu một số trường hợp cấp cứu tại cộng đồng', 'Bác sĩ', 'Số CCHN: 0007032/HD-CCHN', NULL, NULL),
('dp000002-0000-0000-0000-000000000015', 'u0000002-0000-0000-0000-000000000018', 'sp000001-0000-0000-0000-000000000001', 'Khám bệnh, chữa bệnh Hồi sức; gây mê hồi sức', 'Bác sĩ CKI', 'Số CCHN: 001659/PT-CCHN', NULL, 'Làm việc bán thời gian: Thứ 4, Thứ 7 07:00-17:30 (đăng ký hành nghề tại cơ sở khác các ngày còn lại).'),
('dp000002-0000-0000-0000-000000000016', 'u0000002-0000-0000-0000-000000000023', 'sp000002-0000-0000-0000-000000000004', 'Khám bệnh, chữa bệnh ngoại khoa', 'Bác sĩ CKI', 'Số CCHN: 001741/PT-CCHN', NULL, 'Phụ trách Phòng Ngoại.');

-- supplies: 18 common medical supplies added 2026-08-01/02
INSERT IGNORE INTO supplies (id, category_id, name, unit, current_stock, min_stock_level, created_by) VALUES
('sy000002-0000-0000-0000-000000000002', 'sc000001-0000-0000-0000-000000000001', 'Băng dính y tế', 'CAI', 0, 20, 'u0000001-0000-0000-0000-000000000001'),
('sy000002-0000-0000-0000-000000000003', 'sc000001-0000-0000-0000-000000000001', 'Băng gạc cuộn', 'CAI', 0, 20, 'u0000001-0000-0000-0000-000000000001'),
('sy000002-0000-0000-0000-000000000006', 'sc000001-0000-0000-0000-000000000001', 'Bơm tiêm 10ml', 'CAI', 0, 100, 'u0000001-0000-0000-0000-000000000001'),
('sy000002-0000-0000-0000-000000000007', 'sc000001-0000-0000-0000-000000000001', 'Bơm tiêm 5ml', 'CAI', 0, 100, 'u0000001-0000-0000-0000-000000000001'),
('sy000002-0000-0000-0000-000000000001', 'sc000001-0000-0000-0000-000000000001', 'Bông y tế', 'HOP', 0, 20, 'u0000001-0000-0000-0000-000000000001'),
('sy000002-0000-0000-0000-000000000004', 'sc000001-0000-0000-0000-000000000001', 'Cồn 70 độ sát trùng', 'CHAI', 0, 10, 'u0000001-0000-0000-0000-000000000001'),
('sy000002-0000-0000-0000-000000000012', 'sc000001-0000-0000-0000-000000000001', 'Dây truyền dịch', 'BO', 0, 50, 'u0000001-0000-0000-0000-000000000001'),
('sy000002-0000-0000-0000-000000000005', 'sc000001-0000-0000-0000-000000000001', 'Dung dịch Povidine sát trùng', 'CHAI', 0, 10, 'u0000001-0000-0000-0000-000000000001'),
('sy000002-0000-0000-0000-000000000013', 'sc000001-0000-0000-0000-000000000001', 'Dung dịch sát khuẩn tay nhanh', 'CHAI', 0, 10, 'u0000001-0000-0000-0000-000000000001'),
('sy000002-0000-0000-0000-000000000009', 'sc000001-0000-0000-0000-000000000001', 'Găng tay y tế size L', 'KHAC', 0, 100, 'u0000001-0000-0000-0000-000000000001'),
('sy000002-0000-0000-0000-000000000008', 'sc000001-0000-0000-0000-000000000001', 'Găng tay y tế size S', 'KHAC', 0, 100, 'u0000001-0000-0000-0000-000000000001'),
('sy000002-0000-0000-0000-000000000010', 'sc000001-0000-0000-0000-000000000001', 'Khẩu trang y tế', 'HOP', 0, 20, 'u0000001-0000-0000-0000-000000000001'),
('sy000002-0000-0000-0000-000000000011', 'sc000001-0000-0000-0000-000000000001', 'Kim luồn tĩnh mạch', 'CAI', 0, 50, 'u0000001-0000-0000-0000-000000000001'),
('sy000002-0000-0000-0000-000000000016', 'sc000001-0000-0000-0000-000000000002', 'Máy đo huyết áp', 'CAI', 0, 2, 'u0000001-0000-0000-0000-000000000001'),
('sy000002-0000-0000-0000-000000000015', 'sc000001-0000-0000-0000-000000000002', 'Nhiệt kế điện tử', 'CAI', 0, 5, 'u0000001-0000-0000-0000-000000000001'),
('sy000002-0000-0000-0000-000000000014', 'sc000001-0000-0000-0000-000000000002', 'Ống nghe y tế', 'CAI', 0, 2, 'u0000001-0000-0000-0000-000000000001'),
('sy000002-0000-0000-0000-000000000017', 'sc000001-0000-0000-0000-000000000003', 'Ống nghiệm xét nghiệm máu (EDTA)', 'HOP', 0, 20, 'u0000001-0000-0000-0000-000000000001'),
('sy000002-0000-0000-0000-000000000018', 'sc000001-0000-0000-0000-000000000003', 'Que test đường huyết nhanh', 'HOP', 0, 10, 'u0000001-0000-0000-0000-000000000001');

-- medicines: 27 common medicines added 2026-08-01/02 (draft approved by clinic 2026-08-02)
INSERT IGNORE INTO medicines (id, name, active_ingredient, dosage_form, unit, price, contraindications, created_by) VALUES
('md000002-0000-0000-0000-000000000023', 'Alpha Chymotrypsin 4200 đơn vị', 'Alpha Chymotrypsin', 'Viên nén', 'VIEN', 1500, 'Rối loạn đông máu', 'u0000001-0000-0000-0000-000000000001'),
('md000002-0000-0000-0000-000000000009', 'Amlodipine 5mg', 'Amlodipine', 'Viên nén', 'VIEN', 3000, 'Hạ huyết áp nặng, sốc tim', 'u0000001-0000-0000-0000-000000000001'),
('md000002-0000-0000-0000-000000000017', 'Antacid nhôm-magie', 'Nhôm hydroxit, Magie hydroxit', 'Gói hỗn dịch', 'GOI', 3500, 'Suy thận nặng', 'u0000001-0000-0000-0000-000000000001'),
('md000002-0000-0000-0000-000000000018', 'Atorvastatin 10mg', 'Atorvastatin', 'Viên nén', 'VIEN', 4000, 'Bệnh gan hoạt động, phụ nữ có thai', 'u0000001-0000-0000-0000-000000000001'),
('md000002-0000-0000-0000-000000000002', 'Azithromycin 250mg', 'Azithromycin', 'Viên nén', 'VIEN', 8000, 'Suy gan nặng', 'u0000001-0000-0000-0000-000000000001'),
('md000002-0000-0000-0000-000000000022', 'Betahistine 16mg', 'Betahistine', 'Viên nén', 'VIEN', 2500, 'U tủy thượng thận (Pheochromocytoma)', 'u0000001-0000-0000-0000-000000000001'),
('md000002-0000-0000-0000-000000000025', 'Betamethasone + Clotrimazole kem', 'Betamethasone, Clotrimazole', 'Tuýp kem bôi', 'TUYP', 30000, 'Nhiễm virus/nấm da chưa xác định', 'u0000001-0000-0000-0000-000000000001'),
('md000002-0000-0000-0000-000000000015', 'Bromhexine 8mg', 'Bromhexine HCl', 'Viên nén', 'VIEN', 1500, 'Loét dạ dày tá tràng', 'u0000001-0000-0000-0000-000000000001'),
('md000002-0000-0000-0000-000000000026', 'Calci + Vitamin D3', 'Calci carbonat, Cholecalciferol', 'Viên sủi', 'VIEN', 2500, 'Tăng calci máu, sỏi thận calci', 'u0000001-0000-0000-0000-000000000001'),
('md000002-0000-0000-0000-000000000012', 'Cefuroxime 500mg', 'Cefuroxime axetil', 'Viên nén', 'VIEN', 12000, 'Dị ứng Cephalosporin', 'u0000001-0000-0000-0000-000000000001'),
('md000002-0000-0000-0000-000000000001', 'Cephalexin 500mg', 'Cephalexin', 'Viên nang', 'VIEN', 4500, 'Dị ứng Cephalosporin', 'u0000001-0000-0000-0000-000000000001'),
('md000002-0000-0000-0000-000000000014', 'Dextromethorphan 15mg', 'Dextromethorphan', 'Viên nén', 'VIEN', 1500, 'Đang dùng thuốc ức chế MAO', 'u0000001-0000-0000-0000-000000000001'),
('md000002-0000-0000-0000-000000000010', 'Diclofenac gel', 'Diclofenac', 'Tuýp gel bôi', 'TUYP', 25000, 'Vết thương hở', 'u0000001-0000-0000-0000-000000000001'),
('md000002-0000-0000-0000-000000000003', 'Domperidone 10mg', 'Domperidone', 'Viên nén', 'VIEN', 2000, 'Xuất huyết tiêu hóa, bệnh tim nặng', 'u0000001-0000-0000-0000-000000000001'),
('md000002-0000-0000-0000-000000000013', 'Doxycycline 100mg', 'Doxycycline', 'Viên nang', 'VIEN', 3000, 'Phụ nữ có thai, trẻ dưới 8 tuổi', 'u0000001-0000-0000-0000-000000000001'),
('md000002-0000-0000-0000-000000000016', 'Esomeprazole 40mg', 'Esomeprazole', 'Viên nang', 'VIEN', 9000, 'Dùng chung với Rilpivirine', 'u0000001-0000-0000-0000-000000000001'),
('md000002-0000-0000-0000-000000000020', 'Gliclazide 80mg', 'Gliclazide', 'Viên nén', 'VIEN', 3000, 'Đái tháo đường type 1, suy thận nặng', 'u0000001-0000-0000-0000-000000000001'),
('md000002-0000-0000-0000-000000000004', 'Loperamide 2mg', 'Loperamide', 'Viên nang', 'VIEN', 2500, 'Tiêu chảy nhiễm khuẩn có sốt', 'u0000001-0000-0000-0000-000000000001'),
('md000002-0000-0000-0000-000000000006', 'Loratadine 10mg', 'Loratadine', 'Viên nén', 'VIEN', 3000, NULL, 'u0000001-0000-0000-0000-000000000001'),
('md000002-0000-0000-0000-000000000019', 'Losartan 50mg', 'Losartan Kali', 'Viên nén', 'VIEN', 3500, 'Phụ nữ có thai', 'u0000001-0000-0000-0000-000000000001'),
('md000002-0000-0000-0000-000000000024', 'Natri Clorid 0.9% nhỏ mắt', 'Natri Clorid', 'Chai nhỏ mắt', 'CHAI', 8000, NULL, 'u0000001-0000-0000-0000-000000000001'),
('md000002-0000-0000-0000-000000000005', 'Oresol (ORS)', 'Muối bù nước điện giải', 'Gói bột pha', 'GOI', 3000, 'Tắc ruột', 'u0000001-0000-0000-0000-000000000001'),
('md000002-0000-0000-0000-000000000011', 'Povidone-iodine 10%', 'Povidone-iodine', 'Chai dung dịch', 'CHAI', 20000, 'Cường giáp, dị ứng iod', 'u0000001-0000-0000-0000-000000000001'),
('md000002-0000-0000-0000-000000000021', 'Prednisolone 5mg', 'Prednisolone', 'Viên nén', 'VIEN', 1000, 'Nhiễm nấm toàn thân, loét dạ dày tiến triển', 'u0000001-0000-0000-0000-000000000001'),
('md000002-0000-0000-0000-000000000007', 'Salbutamol xịt', 'Salbutamol', 'Bình xịt định liều', 'LO', 45000, 'Rối loạn nhịp tim', 'u0000001-0000-0000-0000-000000000001'),
('md000002-0000-0000-0000-000000000008', 'Vitamin 3B', 'Vitamin B1, B6, B12', 'Viên nén', 'VIEN', 2000, NULL, 'u0000001-0000-0000-0000-000000000001'),
('md000002-0000-0000-0000-000000000027', 'Vitamin D3 1000IU', 'Cholecalciferol', 'Viên nang', 'VIEN', 2000, 'Tăng calci máu', 'u0000001-0000-0000-0000-000000000001');

SET FOREIGN_KEY_CHECKS = 1;
