import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateSpecialtyDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: 'Tên chuyên khoa không được để trống' })
  @MaxLength(100, { message: 'Tên chuyên khoa tối đa 100 ký tự' })
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;
}
