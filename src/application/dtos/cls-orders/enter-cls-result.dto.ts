import { Type } from 'class-transformer';
import { IsArray, IsOptional, IsString, MinLength, ValidateNested } from 'class-validator';

// One row of a structured lab-test result — only meaningful when the CLS
// room is category LAB (see ClsRoomCategory); X-quang/Siêu âm rooms just use
// `summary` free text as before.
export class LabResultRowDto {
  @IsString()
  @MinLength(1)
  name!: string;

  @IsString()
  result!: string;

  @IsOptional()
  @IsString()
  unit?: string;

  @IsOptional()
  @IsString()
  normalRange?: string;

  @IsOptional()
  @IsString()
  note?: string;
}

export class EnterClsResultDto {
  // Holds the "KL" conclusion for every category (the only field for LAB
  // besides `rows`; for X-quang/Siêu âm it's the conclusion shown apart from
  // the descriptive `findings` text below).
  @IsString()
  @MinLength(1)
  summary: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => LabResultRowDto)
  rows?: LabResultRowDto[];

  // Descriptive findings ("KẾT QUẢ") — only meaningful for XRAY/ULTRASOUND.
  @IsOptional()
  @IsString()
  findings?: string;
}
