import { Type } from 'class-transformer';
import { IsBoolean, IsDate, IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, Matches } from 'class-validator';
import { Gender } from '../../../domain/enums/gender.enum';

export class UpdatePatientRequestDto {
  @IsOptional()
  @IsNotEmpty()
  @IsString()
  fullName?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  dateOfBirth?: Date;

  @IsOptional()
  @IsEnum(Gender)
  gender?: Gender;

  @IsOptional()
  @IsString()
  @Matches(/^[0-9+]{8,15}$/, { message: 'phone must be a valid phone number' })
  phone?: string;

  @IsOptional()
  @IsString()
  idCard?: string;

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
