import { Body, Controller, HttpCode, HttpStatus, Post } from "@nestjs/common";
import { ConfirmPaymentUseCase } from "./application/use-cases/confirm-payment.use-case";
import { PixWebhookPayloadDto } from "./dto/pix-webhook-payload.dto";

@Controller("webhooks/banco-inter")
export class PaymentWebhookController {
  constructor(private readonly confirmPaymentUseCase: ConfirmPaymentUseCase) {}

  @Post("pix")
  @HttpCode(HttpStatus.OK)
  async handle(@Body() payload: PixWebhookPayloadDto): Promise<void> {
    for (const event of payload.pix) {
      await this.confirmPaymentUseCase.execute({ pixTxId: event.txid, e2eId: event.endToEndId });
    }
  }
}
