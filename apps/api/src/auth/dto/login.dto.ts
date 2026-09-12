import { IsEmail, IsIn, IsString } from "class-validator";

export class LoginDto {
  @IsIn(["COMPANY", "WORKER"])
  role!: "COMPANY" | "WORKER";

  @IsEmail()
  email!: string;

  @IsString()
  password!: string;
}
