import { IsEnum, IsNotEmpty, IsOptional, IsString, Matches } from 'class-validator';
import { UserRole } from '../../../domain/enums/user-role.enum';

const ALLOWED_ROLES = [UserRole.RECEPTIONIST, UserRole.DOCTOR, UserRole.NURSE, UserRole.LAB_TECH];

export class CreateUserDto {
  @IsNotEmpty()
  @IsString()
  fullName!: string;

  @IsNotEmpty()
  @Matches(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, { message: 'Email không hợp lệ' })
  email!: string;

  @IsNotEmpty()
  @Matches(/^0\d{9}$/, { message: 'Số điện thoại phải gồm 10 chữ số và bắt đầu bằng 0' })
  phone!: string;

  @IsEnum(ALLOWED_ROLES, { message: 'Vai trò không hợp lệ' })
  role!: UserRole;

  @IsOptional()
  @IsString()
  idCard?: string;

  // Department grouping for non-doctor staff (NURSE / LAB_TECH /
  // RECEPTIONIST), for room-picker filtering only — see User.specialtyId.
  @IsOptional()
  @IsString()
  specialtyId?: string;
}
