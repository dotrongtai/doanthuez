import { Type } from 'class-transformer';
import { IsBoolean, IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, Min, MaxLength } from 'class-validator';
import { MeasurementUnit } from '../../../domain/enums/measurement-unit.enum';

// currentStock is intentionally not settable here (Feature 24: "chỉnh sửa
// thông tin (trừ tồn kho)") — it only ever changes via import/distribute/
// return transactions.
export class UpdateSupplyDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: 'Tên vật tư không được để trống' })
  @MaxLength(150, { message: 'Tên vật tư tối đa 150 ký tự' })
  name?: string;

  @IsOptional()
  @IsString()
  categoryId?: string;

  @IsOptional()
  @IsEnum(MeasurementUnit, { message: 'Đơn vị tính không hợp lệ' })
  unit?: MeasurementUnit;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0, { message: 'Mức tồn kho tối thiểu không được âm' })
  minStockLevel?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
