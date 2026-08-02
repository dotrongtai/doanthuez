import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateSupplyCategoryDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: 'Tên danh mục vật tư không được để trống' })
  @MaxLength(100, { message: 'Tên danh mục vật tư tối đa 100 ký tự' })
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;
}
