import { Type } from 'class-transformer';
import { IsBoolean, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString, MaxLength } from 'class-validator';
import { MeasurementUnit } from '../../../domain/enums/measurement-unit.enum';

export class UpdateMedicineDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: 'Tên thuốc không được để trống' })
  @MaxLength(150, { message: 'Tên thuốc tối đa 150 ký tự' })
  name?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: 'Hoạt chất không được để trống' })
  @MaxLength(200, { message: 'Hoạt chất tối đa 200 ký tự' })
  activeIngredient?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: 'Dạng bào chế không được để trống' })
  @MaxLength(50, { message: 'Dạng bào chế tối đa 50 ký tự' })
  dosageForm?: string;

  @IsOptional()
  @IsEnum(MeasurementUnit, { message: 'Đơn vị không hợp lệ' })
  unit?: MeasurementUnit;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @IsPositive({ message: 'Giá phải là số dương' })
  price?: number;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  contraindications?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
