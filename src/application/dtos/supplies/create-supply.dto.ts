import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, Min, MaxLength } from 'class-validator';
import { MeasurementUnit } from '../../../domain/enums/measurement-unit.enum';

export class CreateSupplyDto {
  @IsString()
  @IsNotEmpty({ message: 'Tên vật tư không được để trống' })
  @MaxLength(150, { message: 'Tên vật tư tối đa 150 ký tự' })
  name: string;

  @IsString()
  @IsNotEmpty({ message: 'Danh mục vật tư không được để trống' })
  categoryId: string;

  @IsEnum(MeasurementUnit, { message: 'Đơn vị tính không hợp lệ' })
  unit: MeasurementUnit;

  @IsOptional()
  @IsString()
  description?: string;

  @Type(() => Number)
  @IsInt()
  @Min(0, { message: 'Mức tồn kho tối thiểu không được âm' })
  minStockLevel: number;
}
