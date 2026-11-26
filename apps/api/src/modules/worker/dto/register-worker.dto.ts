import { IsBoolean, IsEmail, IsString, MinLength } from "class-validator";

export class RegisterWorkerDto {
  @IsString()
  cpf!: string;

  @IsString()
  nome!: string;

  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(8)
  password!: string;

  @IsBoolean()
  acceptTerms!: boolean;

  @IsBoolean()
  acceptPrivacyPolicy!: boolean;

  @IsBoolean()
  confirmAdult!: boolean;
}
