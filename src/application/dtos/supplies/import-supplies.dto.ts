import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';

export class ImportSupplyLineDto {
  @IsString()
  @IsNotEmpty({ message: 'Vật tư không được để trống' })
  supplyId: string;

  // Positivity is enforced in ImportSuppliesUseCase via InvalidQuantityError
  // (MSG_ERR_0050), not here — Feature 28's "quantity > 0" is a reserved
  // domain-specific message code, not the generic VALIDATION_FAILED one a
  // class-validator decorator would produce.
  @Type(() => Number)
  @IsInt()
  quantity: number;

  @Type(() => Number)
  @IsNumber()
  @Min(0, { message: 'Giá nhập không được âm' })
  unitPrice: number;

  @IsOptional()
  @IsDateString()
  expiryDate?: string;
}

export class ImportSuppliesDto {
  @IsString()
  @IsNotEmpty({ message: 'Nhà cung cấp không được để trống' })
  supplierId: string;

  @IsArray()
  @ArrayMinSize(1, { message: 'Cần ít nhất một dòng vật tư để nhập kho' })
  @ValidateNested({ each: true })
  @Type(() => ImportSupplyLineDto)
  items: ImportSupplyLineDto[];
}
