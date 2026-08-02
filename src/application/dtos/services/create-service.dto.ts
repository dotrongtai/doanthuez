import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString, MaxLength } from 'class-validator';
import { Type } from 'class-transformer';
import { ClsRoomCategory } from '../../../domain/enums/cls-room-category.enum';
import { ServiceType } from '../../../domain/enums/service-type.enum';

export class CreateServiceDto {
  @IsString()
  @IsNotEmpty({ message: 'Tên dịch vụ không được để trống' })
  @MaxLength(50, { message: 'Tên dịch vụ tối đa 50 ký tự' })
  name: string;

  @IsOptional()
  @IsString()
  specialtyId?: string;

  @IsOptional()
  @IsEnum(ServiceType, { message: 'Loại dịch vụ không hợp lệ (EXAMINATION hoặc CLS)' })
  type?: ServiceType;

  // Only meaningful when type = CLS — required for CLS services, forbidden
  // for EXAMINATION services (enforced in CreateServiceUseCase).
  @IsOptional()
  @IsEnum(ClsRoomCategory, { message: 'Nhóm CLS không hợp lệ (LAB, XRAY, ULTRASOUND hoặc ECG)' })
  clsCategory?: ClsRoomCategory;

  @Type(() => Number)
  @IsNumber()
  @IsPositive({ message: 'Giá phải là số dương' })
  price: number;

  @IsOptional()
  @IsString()
  description?: string;
}
