import { Type } from "class-transformer";
import { IsArray, IsString, ValidateNested } from "class-validator";

export class PixWebhookEventDto {
  @IsString()
  txid!: string;

  @IsString()
  endToEndId!: string;
}

export class PixWebhookPayloadDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PixWebhookEventDto)
  pix!: PixWebhookEventDto[];
}
