import { IsString } from "class-validator";

export class CreatePixChargeDto {
  @IsString()
  creditPackageId!: string;
}
