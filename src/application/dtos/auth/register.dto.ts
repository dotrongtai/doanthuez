import { IsDateString, IsEmail, IsEnum, IsNotEmpty, IsString, Matches } from 'class-validator';
import { Gender } from '../../../domain/enums/gender.enum';

export class RegisterRequestDto {
  @IsNotEmpty()
  @IsString()
  fullName!: string;

  @IsEmail()
  email!: string;

  @IsString()
  @Matches(/^[0-9+]{8,15}$/, { message: 'phone must be a valid phone number' })
  phone!: string;

  @IsDateString()
  dateOfBirth!: string;

  @IsEnum(Gender)
  gender!: Gender;

  @IsNotEmpty()
  @IsString()
  idCard!: string;

  @IsNotEmpty()
  @IsString()
  password!: string;

  @IsNotEmpty()
  @IsString()
  confirmPassword!: string;
}
