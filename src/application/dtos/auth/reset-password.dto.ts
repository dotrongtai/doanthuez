import { IsNotEmpty, IsString, Length } from 'class-validator';

export class ResetPasswordRequestDto {
  @IsNotEmpty()
  @IsString()
  username!: string;

  @IsNotEmpty()
  @IsString()
  @Length(6, 6)
  otpCode!: string;

  @IsNotEmpty()
  @IsString()
  newPassword!: string;

  @IsNotEmpty()
  @IsString()
  confirmPassword!: string;
}
