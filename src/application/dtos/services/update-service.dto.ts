import { IsBoolean, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString, MaxLength } from 'class-validator';
import { Type } from 'class-transformer';
import { ServiceType } from '../../../domain/enums/service-type.enum';
import { ClsRoomCategory } from '../../../domain/enums/cls-room-category.enum';

export class UpdateServiceDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: 'Tên dịch vụ không được để trống' })
  @MaxLength(50, { message: 'Tên dịch vụ tối đa 50 ký tự' })
  name?: string;

  @IsOptional()
  @IsString()
  specialtyId?: string;

  @IsOptional()
  @IsEnum(ServiceType, { message: 'Loại dịch vụ không hợp lệ (EXAMINATION hoặc CLS)' })
  type?: ServiceType;

  // Only meaningful when the resulting type = CLS — required in that case,
  // forbidden when the resulting type = EXAMINATION (enforced in
  // UpdateServiceUseCase). Nullable so a CLS->EXAMINATION type change (or an
  // explicit correction) can clear a previously-set category.
  @IsOptional()
  @IsEnum(ClsRoomCategory, { message: 'Nhóm CLS không hợp lệ (LAB, XRAY, ULTRASOUND hoặc ECG)' })
  clsCategory?: ClsRoomCategory | null;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @IsPositive({ message: 'Giá phải là số dương' })
  price?: number;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
