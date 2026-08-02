import { IsEmail, IsNotEmpty, IsOptional, IsString, Matches, MaxLength } from 'class-validator';

export class CreateSupplierDto {
  @IsString()
  @IsNotEmpty({ message: 'Tên nhà cung cấp không được để trống' })
  @MaxLength(150, { message: 'Tên nhà cung cấp tối đa 150 ký tự' })
  name!: string;

  @IsOptional()
  @IsString()
  @Matches(/^(0|\+84)(3|5|7|8|9)[0-9]{8}$/, { message: 'Số điện thoại không hợp lệ (VD: 0912345678)' })
  phone?: string;

  @IsOptional()
  @IsEmail({}, { message: 'Email không hợp lệ' })
  email?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  description?: string;
}
