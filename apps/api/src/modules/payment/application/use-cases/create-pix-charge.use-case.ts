import { Inject, Injectable, Logger } from "@nestjs/common";
import { CREDIT_PACKAGE_REPOSITORY, PAYMENT_REPOSITORY, PIX_PAYMENT_GATEWAY } from "../../payment.tokens";
import { Payment } from "../../domain/payment.entity";
import { CreditPackageNotFoundError } from "../errors";
import { CreditPackageRepository } from "../ports/credit-package-repository.port";
import { PaymentRepository } from "../ports/payment-repository.port";
import { PixPaymentGateway } from "../ports/pix-payment-gateway.port";

const CHARGE_VALIDITY_MINUTES = 30;

export interface CreatePixChargeInput {
  workerId: string;
  creditPackageId: string;
}

export interface CreatePixChargeOutput {
  paymentId: string;
  qrCode: string;
  qrCodeImageBase64: string;
  expiresAt: Date;
}

@Injectable()
export class CreatePixChargeUseCase {
  private readonly logger = new Logger(CreatePixChargeUseCase.name);

  constructor(
    @Inject(PAYMENT_REPOSITORY) private readonly paymentRepository: PaymentRepository,
    @Inject(CREDIT_PACKAGE_REPOSITORY) private readonly creditPackageRepository: CreditPackageRepository,
    @Inject(PIX_PAYMENT_GATEWAY) private readonly pixPaymentGateway: PixPaymentGateway,
  ) {}

  async execute(input: CreatePixChargeInput): Promise<CreatePixChargeOutput> {
    const creditPackage = await this.creditPackageRepository.findById(input.creditPackageId);
    if (!creditPackage || !creditPackage.active) {
      throw new CreditPackageNotFoundError(`Pacote de créditos não encontrado: ${input.creditPackageId}`);
    }

    const expiresAt = new Date(Date.now() + CHARGE_VALIDITY_MINUTES * 60 * 1000);

    const payment = Payment.create({
      workerId: input.workerId,
      creditPackageId: creditPackage.id,
      amount: creditPackage.price,
      creditsAmount: creditPackage.creditsAmount,
      expiresAt,
    });

    let charge;
    try {
      charge = await this.pixPaymentGateway.createCharge({
        amount: payment.amount,
        externalReferenceId: payment.id,
        expiresAt: payment.expiresAt,
      });
    } catch (error) {
      // Alvo de alerta: uma falha aqui normalmente significa que o Banco
      // Inter está fora do ar ou as credenciais/certificado expiraram.
      this.logger.error(`Falha ao criar cobrança Pix para o pagamento ${payment.id}`, error as Error);
      throw error;
    }

    await this.paymentRepository.save(payment);
    this.logger.log(`Cobrança Pix ${payment.id} criada para o trabalhador ${input.workerId}`);

    return {
      paymentId: payment.id,
      qrCode: charge.qrCode,
      qrCodeImageBase64: charge.qrCodeImageBase64,
      expiresAt: payment.expiresAt,
    };
  }
}
