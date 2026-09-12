import { IsString, MinLength } from "class-validator";

export class RejectJobPostingDto {
  @IsString()
  @MinLength(3)
  reason!: string;
}
