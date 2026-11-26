import { IsOptional, IsString, MaxLength } from "class-validator";

export class UpdateCompanyProfileDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  nomeFantasia?: string | null;

  @IsOptional()
  @IsString()
  sector?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  city?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(2)
  state?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  whatsapp?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  website?: string | null;
}
