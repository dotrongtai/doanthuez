import { Type } from 'class-transformer';
import { IsInt, IsNotEmpty, IsString } from 'class-validator';

export class DistributeSupplyDto {
  @IsString()
  @IsNotEmpty({ message: 'Vật tư không được để trống' })
  supplyId: string;

  @IsString()
  @IsNotEmpty({ message: 'Phòng không được để trống' })
  roomId: string;

  // Positivity is enforced in DistributeSupplyUseCase via InvalidQuantityError
  // (MSG_ERR_0050) rather than a class-validator decorator — see the same
  // note in import-supplies.dto.ts.
  @Type(() => Number)
  @IsInt()
  quantity: number;
}
