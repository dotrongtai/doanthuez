import { Type } from 'class-transformer';
import { IsBoolean, IsDate, IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, Matches } from 'class-validator';
import { Gender } from '../../../domain/enums/gender.enum';

export class CreatePatientRequestDto {
  @IsNotEmpty()
  @IsString()
  fullName!: string;

  // Mandatory (like phone/idCard below) — every patient account needs a
  // real email of its own now; login itself accepts email, phone, or
  // idCard, so this is no longer "the" identifier, just a required contact
  // detail.
  @IsEmail()
  email!: string;

  @Type(() => Date)
  @IsDate()
  dateOfBirth!: Date;

  @IsEnum(Gender)
  gender!: Gender;

  @IsString()
  @Matches(/^[0-9+]{8,15}$/, { message: 'phone must be a valid phone number' })
  phone!: string;

  // Mandatory (2026-07-19) — CCCD/CMND, like email and phone, is always
  // required and works as a login identifier in its own right (LoginUseCase
  // accepts any of the three).
  @IsNotEmpty()
  @IsString()
  idCard!: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  note?: string;

  @IsOptional()
  @IsBoolean()
  notificationConsent?: boolean;
}
