import { IsEmail, IsNotEmpty, IsOptional, IsString, Matches } from 'class-validator';

export class UpdateProfileRequestDto {
  @IsOptional()
  @IsNotEmpty()
  @IsString()
  fullName?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  @Matches(/^[0-9+]{8,15}$/, { message: 'phone must be a valid phone number' })
  phone?: string;
}
