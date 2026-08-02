import { IsNotEmpty, IsString } from 'class-validator';

export class ForgotPasswordRequestDto {
  // Accepts either an email or a phone number.
  @IsNotEmpty()
  @IsString()
  username!: string;
}
