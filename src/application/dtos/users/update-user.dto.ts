import { IsEnum, IsOptional, IsString, Matches } from 'class-validator';
import { UserRole } from '../../../domain/enums/user-role.enum';

const ALLOWED_ROLES = [UserRole.RECEPTIONIST, UserRole.DOCTOR, UserRole.NURSE, UserRole.LAB_TECH];

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  fullName?: string;

  @IsOptional()
  @Matches(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, { message: 'Email không hợp lệ' })
  email?: string;

  @IsOptional()
  @Matches(/^0\d{9}$/, { message: 'Số điện thoại phải gồm 10 chữ số và bắt đầu bằng 0' })
  phone?: string;

  @IsOptional()
  @IsEnum(ALLOWED_ROLES, { message: 'Vai trò không hợp lệ' })
  role?: UserRole;

  @IsOptional()
  @IsString()
  idCard?: string;

  // Department grouping for non-doctor staff, for room-picker filtering
  // only. `undefined` = leave unchanged, `null` = explicitly clear back to
  // unset.
  @IsOptional()
  @IsString()
  specialtyId?: string | null;
}
