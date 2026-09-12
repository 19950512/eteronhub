import { Body, Controller, HttpCode, HttpStatus, Logger, Post, UseGuards } from "@nestjs/common";
import { Throttle } from "@nestjs/throttler";
import { WEBHOOK_THROTTLE } from "../../infra/http/rate-limits";
import { ConfirmPaymentUseCase } from "./application/use-cases/confirm-payment.use-case";
import { PixWebhookPayloadDto } from "./dto/pix-webhook-payload.dto";
import { WebhookSecretGuard } from "./infra/pix/webhook-secret.guard";

@Controller("webhooks/banco-inter")
export class PaymentWebhookController {
  private readonly logger = new Logger(PaymentWebhookController.name);

  constructor(private readonly confirmPaymentUseCase: ConfirmPaymentUseCase) {}

  @UseGuards(WebhookSecretGuard)
  @Throttle(WEBHOOK_THROTTLE)
  @Post("pix")
  @HttpCode(HttpStatus.OK)
  async handle(@Body() payload: PixWebhookPayloadDto): Promise<void> {
    this.logger.log(`Recebido webhook do Banco Inter com ${payload.pix.length} evento(s) de pagamento`);
    for (const event of payload.pix) {
      await this.confirmPaymentUseCase.execute({ pixTxId: event.txid, e2eId: event.endToEndId });
    }
  }
}
