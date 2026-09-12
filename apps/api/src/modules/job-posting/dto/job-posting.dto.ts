import { IsEmail, IsInt, IsOptional, IsString, IsUrl, Min } from "class-validator";

export class JobPostingDto {
  @IsString()
  title!: string;

  @IsString()
  description!: string;

  @IsString()
  requirements!: string;

  @IsInt()
  @Min(0)
  salaryMinCents!: number;

  @IsInt()
  @Min(0)
  salaryMaxCents!: number;

  @IsString()
  location!: string;

  @IsOptional()
  @IsEmail()
  contactEmail?: string;

  @IsOptional()
  @IsString()
  contactPhone?: string;

  @IsOptional()
  @IsUrl()
  contactApplicationUrl?: string;

  @IsInt()
  @Min(0)
  unlockCost!: number;
}
