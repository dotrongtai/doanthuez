import { IsNotEmpty, IsString, Length } from 'class-validator';

export class VerifyOtpRequestDto {
  @IsNotEmpty()
  @IsString()
  username!: string;

  @IsNotEmpty()
  @IsString()
  @Length(6, 6)
  otpCode!: string;
}
