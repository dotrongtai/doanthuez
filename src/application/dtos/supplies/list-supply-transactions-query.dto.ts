import { IsDateString, IsEnum, IsOptional } from 'class-validator';
import { PaginationDto } from '../pagination.dto';
import { SupplyTransactionType } from '../../../domain/enums/supply-transaction-type.enum';

export class ListSupplyTransactionsQueryDto extends PaginationDto {
  @IsOptional()
  @IsDateString()
  from?: string;

  @IsOptional()
  @IsDateString()
  to?: string;

  @IsOptional()
  @IsEnum(SupplyTransactionType, { message: 'type phải là IMPORT, DISTRIBUTE hoặc RETURN' })
  type?: SupplyTransactionType;
}
