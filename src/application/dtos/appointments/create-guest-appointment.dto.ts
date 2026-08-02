import { Type } from 'class-transformer';
import { IsDate, IsDateString, IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, Matches } from 'class-validator';
import { Gender } from '../../../domain/enums/gender.enum';

// Combines RegisterRequestDto's account-creation fields with
// CreateAppointmentRequestDto's booking fields — used by the unauthenticated
// "book + create account in one step" guest flow (see
// CreateGuestAppointmentUseCase). Field-for-field validation is copied from
// both of those DTOs rather than re-derived. No password field — the guest
// doesn't choose one; the account starts on DEFAULT_PATIENT_PASSWORD with
// mustChangePassword: true, same as a receptionist-created walk-in patient.
export class CreateGuestAppointmentRequestDto {
  // ─── Account fields (mirrors RegisterRequestDto) ──────────────────────
  @IsNotEmpty()
  @IsString()
  fullName!: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsString()
  @Matches(/^[0-9+]{8,15}$/, { message: 'phone must be a valid phone number' })
  phone!: string;

  @IsDateString()
  dateOfBirth!: string;

  @IsOptional()
  @IsEnum(Gender)
  gender?: Gender;

  @IsOptional()
  @IsString()
  idCard?: string;

  // ─── Booking fields (mirrors CreateAppointmentRequestDto) ─────────────
  @IsOptional()
  @IsString()
  doctorId?: string;

  @IsOptional()
  @IsString()
  serviceId?: string;

  @Type(() => Date)
  @IsDate()
  appointmentTime!: Date;

  @IsOptional()
  @IsString()
  note?: string;
}
