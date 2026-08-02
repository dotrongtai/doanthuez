import { IsEnum, IsOptional, IsString } from 'class-validator';
import { PaginationDto } from '../pagination.dto';
import { SupplyStockStatus } from '../../../domain/enums/supply-stock-status.enum';

export class ListSuppliesQueryDto extends PaginationDto {
  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsEnum(SupplyStockStatus, { message: 'status phải là LOW_STOCK hoặc NORMAL' })
  status?: SupplyStockStatus;

  @IsOptional()
  @IsString()
  search?: string;
}
