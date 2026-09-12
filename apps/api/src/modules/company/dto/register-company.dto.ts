import { IsEmail, IsOptional, IsString, MinLength } from "class-validator";

export class RegisterCompanyDto {
  @IsString()
  cnpj!: string;

  @IsString()
  razaoSocial!: string;

  @IsOptional()
  @IsString()
  nomeFantasia?: string;

  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(8)
  password!: string;
}
