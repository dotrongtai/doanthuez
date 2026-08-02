export const MSG = {
  // INFO — xem docs/system_messages.md để biết context đầy đủ
  INFO_0001: 'MSG_INFO_0001', // Đăng nhập thành công
  INFO_0002: 'MSG_INFO_0002', // Lịch hẹn được xác nhận
  INFO_0004: 'MSG_INFO_0004', // Bệnh nhân đặt lịch
  INFO_0005: 'MSG_INFO_0005', // Cập nhật hồ sơ bệnh nhân
  INFO_0006: 'MSG_INFO_0006', // Thanh toán hóa đơn
  INFO_0007: 'MSG_INFO_0007', // Tạo tài khoản
  INFO_0008: 'MSG_INFO_0008', // Đổi mật khẩu
  INFO_0009: 'MSG_INFO_0009', // Đăng xuất
  INFO_0010: 'MSG_INFO_0010', // Gửi mã OTP
  INFO_0011: 'MSG_INFO_0011', // Đặt lại mật khẩu
  INFO_0012: 'MSG_INFO_0012', // Cập nhật hồ sơ cá nhân
  INFO_0013: 'MSG_INFO_0013', // Cập nhật tài khoản nhân sự
  INFO_0014: 'MSG_INFO_0014', // Kích hoạt tài khoản
  INFO_0015: 'MSG_INFO_0015', // Vô hiệu hóa tài khoản
  INFO_0016: 'MSG_INFO_0016', // Mở khóa tài khoản
  INFO_0017: 'MSG_INFO_0017', // Admin reset mật khẩu
  INFO_0018: 'MSG_INFO_0018', // Tạo hồ sơ bệnh nhân
  INFO_0021: 'MSG_INFO_0021', // Tạo phòng
  INFO_0022: 'MSG_INFO_0022', // Cập nhật phòng
  INFO_0023: 'MSG_INFO_0023', // Kích hoạt phòng
  INFO_0024: 'MSG_INFO_0024', // Vô hiệu hóa phòng
  INFO_0025: 'MSG_INFO_0025', // Tạo dịch vụ
  INFO_0026: 'MSG_INFO_0026', // Cập nhật dịch vụ
  INFO_0027: 'MSG_INFO_0027', // Xóa dịch vụ
  INFO_0030: 'MSG_INFO_0030', // Cập nhật hồ sơ bác sĩ
  INFO_0031: 'MSG_INFO_0031', // Tạo lịch làm việc
  INFO_0032: 'MSG_INFO_0032', // Cập nhật lịch làm việc
  INFO_0033: 'MSG_INFO_0033', // Xóa lịch làm việc
  INFO_0034: 'MSG_INFO_0034', // Lễ tân tạo lịch hẹn
  INFO_0035: 'MSG_INFO_0035', // Từ chối lịch hẹn
  INFO_0036: 'MSG_INFO_0036', // Cập nhật lịch hẹn
  INFO_0037: 'MSG_INFO_0037', // Hủy lịch hẹn
  INFO_0038: 'MSG_INFO_0038', // Check-in bệnh nhân
  INFO_0044: 'MSG_INFO_0044', // Gọi bệnh nhân vào phòng khám
  INFO_0045: 'MSG_INFO_0045', // Bắt đầu khám
  INFO_0046: 'MSG_INFO_0046', // Hoàn thành lượt khám
  INFO_0047: 'MSG_INFO_0047', // Tạo phiếu CLS
  INFO_0048: 'MSG_INFO_0048', // Gọi vào phòng CLS
  INFO_0049: 'MSG_INFO_0049', // Cập nhật kết quả CLS
  INFO_0051: 'MSG_INFO_0051', // Upload file CLS
  INFO_0052: 'MSG_INFO_0052', // Lưu kết quả khám
  INFO_0053: 'MSG_INFO_0053', // Cập nhật kết quả khám
  INFO_0055: 'MSG_INFO_0055', // Tạo đơn thuốc
  INFO_0060: 'MSG_INFO_0060', // Tạo hóa đơn
  INFO_0063: 'MSG_INFO_0063', // Tạo danh mục vật tư
  INFO_0064: 'MSG_INFO_0064', // Cập nhật danh mục vật tư
  INFO_0065: 'MSG_INFO_0065', // Xóa danh mục vật tư
  INFO_0066: 'MSG_INFO_0066', // Tạo nhà cung cấp
  INFO_0067: 'MSG_INFO_0067', // Cập nhật nhà cung cấp
  INFO_0068: 'MSG_INFO_0068', // Xóa nhà cung cấp
  INFO_0069: 'MSG_INFO_0069', // Tạo vật tư
  INFO_0070: 'MSG_INFO_0070', // Cập nhật vật tư
  INFO_0071: 'MSG_INFO_0071', // Nhập kho vật tư
  INFO_0072: 'MSG_INFO_0072', // Phân phối vật tư
  INFO_0076: 'MSG_INFO_0076', // Thêm thuốc vào danh mục
  INFO_0077: 'MSG_INFO_0077', // Cập nhật thông tin thuốc
  INFO_0078: 'MSG_INFO_0078', // Xóa thuốc khỏi danh mục
  INFO_0080: 'MSG_INFO_0080', // Tạm rời phòng khám chờ kết quả CLS
  INFO_0081: 'MSG_INFO_0081', // Đánh dấu vắng mặt
  INFO_0083: 'MSG_INFO_0083', // Đánh dấu thông báo đã đọc
  INFO_0084: 'MSG_INFO_0084', // Đánh dấu tất cả thông báo đã đọc
  INFO_0087: 'MSG_INFO_0087', // Tạo lịch làm việc hàng loạt
  INFO_0088: 'MSG_INFO_0088', // Sửa phiếu CLS
  INFO_0089: 'MSG_INFO_0089', // Lưu chỉ số sinh hiệu

  // WARN — none currently in use (removed 2026-08-02 catalog cleanup, whole
  // category had zero backend/frontend usage); re-add here if a future
  // feature needs a distinct warning severity from ERR/INFO.

  // ERR
  ERR_0002: 'MSG_ERR_0002', // Tài khoản bị khóa do đăng nhập sai
  ERR_0005: 'MSG_ERR_0005', // OTP không hợp lệ / hết hạn

  // ERR — dùng chung, ánh xạ từ HTTP status / GlobalExceptionFilter
  ERR_0006: 'MSG_ERR_0006', // VALIDATION_FAILED (400)
  ERR_0007: 'MSG_ERR_0007', // INVALID_SESSION / UNAUTHORIZED (401)
  ERR_0008: 'MSG_ERR_0008', // FORBIDDEN (403)
  ERR_0009: 'MSG_ERR_0009', // NOT_FOUND (404), param {resource}
  ERR_0010: 'MSG_ERR_0010', // CONFLICT / DUPLICATE (409)
  ERR_0011: 'MSG_ERR_0011', // INTERNAL_ERROR (500)
  ERR_0012: 'MSG_ERR_0012', // INVALID_CREDENTIALS (401, sai email/mật khẩu)
  ERR_0013: 'MSG_ERR_0013', // WEAK_PASSWORD (400, mật khẩu mới không đạt yêu cầu độ mạnh)
  ERR_0014: 'MSG_ERR_0014', // ACCOUNT_INACTIVE (403, tài khoản bị vô hiệu hóa)
  ERR_0015: 'MSG_ERR_0015', // SAME_PASSWORD (400, mật khẩu mới trùng mật khẩu cũ)
  ERR_0028: 'MSG_ERR_0028', // SERVICE_IN_USE — xóa dịch vụ đang sử dụng
  ERR_0031: 'MSG_ERR_0031', // Lịch trực bị trùng
  ERR_0032: 'MSG_ERR_0032', // Xóa lịch có lịch hẹn
  ERR_0033: 'MSG_ERR_0033', // Bác sĩ không có ca trực
  ERR_0034: 'MSG_ERR_0034', // Lý do hủy bỏ trống
  ERR_0035: 'MSG_ERR_0035', // Hủy lịch đã check-in
  ERR_0036: 'MSG_ERR_0036', // Cập nhật lịch đã check-in
  ERR_0037: 'MSG_ERR_0037', // Giờ hẹn mới bị trùng
  ERR_0038: 'MSG_ERR_0038', // Lý do từ chối bỏ trống
  ERR_0044: 'MSG_ERR_0044', // Hóa đơn đã tồn tại
  ERR_0045: 'MSG_ERR_0045', // Tạo hóa đơn cho lịch chưa hoàn thành
  ERR_0046: 'MSG_ERR_0046', // Tên danh mục vật tư đã tồn tại
  ERR_0047: 'MSG_ERR_0047', // Xóa danh mục đang có vật tư
  ERR_0048: 'MSG_ERR_0048', // Tên nhà cung cấp đã tồn tại
  ERR_0049: 'MSG_ERR_0049', // Tồn kho không đủ để phân phối
  ERR_0050: 'MSG_ERR_0050', // Số lượng không hợp lệ
  ERR_0051: 'MSG_ERR_0051', // Tên thuốc đã tồn tại
  ERR_0052: 'MSG_ERR_0052', // Xóa thuốc đang trong đơn
  ERR_0057: 'MSG_ERR_0057', // Dịch vụ chưa được gán chuyên khoa
  ERR_0058: 'MSG_ERR_0058', // Phòng đã được gán cho nhân viên khác cùng ca
  ERR_0059: 'MSG_ERR_0059', // Chưa có phiếu CLS nào để tạm rời phòng chờ kết quả
  ERR_0061: 'MSG_ERR_0061', // Khoảng ngày không hợp lệ (toDate < fromDate) — dùng chung cho tạo lịch làm việc hàng loạt
  ERR_0062: 'MSG_ERR_0062', // Khung giờ đặt lịch đã ở trong quá khứ
  ERR_0063: 'MSG_ERR_0063', // Chỉ được check-in đúng ngày hẹn khám
  ERR_0064: 'MSG_ERR_0064', // Phòng khám đang có bệnh nhân đang khám
  ERR_0065: 'MSG_ERR_0065', // Chưa có phiếu kết quả khám để hoàn tất
  ERR_0066: 'MSG_ERR_0066', // Mật khẩu mới và xác nhận mật khẩu không khớp
  ERR_0067: 'MSG_ERR_0067', // Xóa vật tư còn tồn kho > 0
  ERR_0068: 'MSG_ERR_0068', // Xóa vật tư đã có lịch sử giao dịch
  ERR_0069: 'MSG_ERR_0069', // Xóa nhà cung cấp còn gắn với lô vật tư đã nhập
  ERR_0070: 'MSG_ERR_0070', // Đặt lịch nhanh vào giờ nghỉ trưa
  ERR_0071: 'MSG_ERR_0071', // Dịch vụ CLS phải chọn loại phòng thực hiện (clsCategory)
  ERR_0072: 'MSG_ERR_0072', // Dịch vụ khám (EXAMINATION) không được gán loại phòng CLS
  ERR_0073: 'MSG_ERR_0073', // Dịch vụ CLS không khớp với loại phòng đã chọn khi tạo phiếu CLS
  ERR_0074: 'MSG_ERR_0074', // Dịch vụ CLS không thể dùng để đặt/sửa lịch hẹn khám
  // ERR_0075-0092: dedicated state-conflict messages, replacing the shared
  // generic MSG_ERR_0010 ("{resource} đã tồn tại hoặc bị xung đột.") which
  // rendered a literal unfilled {resource} placeholder to users, since none
  // of these call sites ever passed a `resource` param — see 2026-08-02
  // message-catalog audit.
  ERR_0075: 'MSG_ERR_0075', // Lịch hẹn chưa được xác nhận
  ERR_0076: 'MSG_ERR_0076', // Lịch hẹn không ở trạng thái chờ xác nhận
  ERR_0077: 'MSG_ERR_0077', // Bệnh nhân chưa được tiếp đón (check-in)
  ERR_0078: 'MSG_ERR_0078', // Lượt khám không ở trạng thái chờ
  ERR_0079: 'MSG_ERR_0079', // Lượt khám không ở trạng thái đang khám
  ERR_0080: 'MSG_ERR_0080', // Không thể gọi bệnh nhân ở trạng thái hiện tại
  ERR_0081: 'MSG_ERR_0081', // Không thể bắt đầu khám ở trạng thái hiện tại
  ERR_0082: 'MSG_ERR_0082', // Không thể tạm giữ lượt khám ở trạng thái hiện tại
  ERR_0083: 'MSG_ERR_0083', // Lượt khám chưa được gọi
  ERR_0084: 'MSG_ERR_0084', // Không thể in phiếu số thứ tự ở trạng thái hiện tại
  ERR_0085: 'MSG_ERR_0085', // Phiếu chỉ định CLS không ở trạng thái chờ thực hiện
  ERR_0086: 'MSG_ERR_0086', // Phiếu chỉ định CLS không ở trạng thái đang thực hiện
  ERR_0087: 'MSG_ERR_0087', // Phòng CLS đang bận
  ERR_0088: 'MSG_ERR_0088', // Lượt khám còn phiếu chỉ định CLS chưa hoàn thành
  ERR_0089: 'MSG_ERR_0089', // Kết quả khám cho lượt khám này đã tồn tại
  ERR_0090: 'MSG_ERR_0090', // Mã tra cứu đã hết hạn
  ERR_0091: 'MSG_ERR_0091', // Đơn thuốc cho lượt khám này đã tồn tại
  ERR_0092: 'MSG_ERR_0092', // Hóa đơn này đã được thanh toán
  // ERR_0093-0094: AI errors previously mis-reused ERR_0064/ERR_0065
  // (RoomBusyError / ExaminationResultRequiredError's messages), which
  // showed a completely unrelated error to the user on AI failures.
  ERR_0093: 'MSG_ERR_0093', // Dịch vụ tóm tắt AI hiện không khả dụng
  ERR_0094: 'MSG_ERR_0094', // Đã vượt giới hạn số lần gọi AI
} as const;

export type MessageCode = (typeof MSG)[keyof typeof MSG];

export class MessageCodeValue {
  private constructor(public readonly value: string) {}

  static create(value: string): MessageCodeValue {
    if (!/^MSG_(INFO|WARN|ERR)_\d{4}$/.test(value)) {
      throw new Error(`Invalid message code: ${value}`);
    }

    return new MessageCodeValue(value);
  }
}
