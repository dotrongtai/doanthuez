import { Inject, Injectable } from '@nestjs/common';
import { OtpPurpose } from '../../../domain/enums/otp-purpose.enum';
import { OTP_TOKEN_REPOSITORY, OtpTokenRepository } from '../../../domain/repositories/otp-token.repository';
import { USER_REPOSITORY, UserRepository } from '../../../domain/repositories/user.repository';
import { ResourceNotFoundError } from '../../errors/application-error';
import { EMAIL_PORT, EmailPort } from '../../ports/email.port';
import { generateOtpCode, OTP_TTL_MINUTES } from './otp.util';

export interface ForgotPasswordInput {
  username: string;
}

export interface ForgotPasswordResult {
  email: string;
}

@Injectable()
export class ForgotPasswordUseCase {
  constructor(
    @Inject(USER_REPOSITORY) private readonly userRepository: UserRepository,
    @Inject(OTP_TOKEN_REPOSITORY) private readonly otpTokenRepository: OtpTokenRepository,
    @Inject(EMAIL_PORT) private readonly emailPort: EmailPort,
  ) {}

  // Lookup still accepts either email or phone as the username (matches the
  // login form), but the OTP itself always goes to the account's email —
  // SMS delivery was removed, every User row already has a required email.
  // Returns the destination email so the controller can interpolate it into
  // MSG_INFO_0010 ("Mã OTP đã được gửi đến {email}...") — `input.username`
  // itself can't be used for that since it may have been a phone number.
  async execute(input: ForgotPasswordInput): Promise<ForgotPasswordResult> {
    const user = await this.userRepository.findByEmailOrPhone(input.username);
    if (!user) throw new ResourceNotFoundError('User');

    const otpCode = generateOtpCode();
    const expiresAt = new Date(Date.now() + OTP_TTL_MINUTES * 60 * 1000);

    // A new OTP request invalidates every previously issued OTP for this purpose.
    await this.otpTokenRepository.invalidateAllForUser(user.id, OtpPurpose.FORGOT_PASSWORD);
    await this.otpTokenRepository.create({
      userId: user.id,
      otpCode,
      purpose: OtpPurpose.FORGOT_PASSWORD,
      expiresAt,
    });

    await this.emailPort.send({
      to: user.email,
      subject: 'Mã OTP đặt lại mật khẩu',
      body: `Mã OTP của bạn là ${otpCode}. Mã có hiệu lực trong ${OTP_TTL_MINUTES} phút.`,
    });

    return { email: user.email };
  }
}
