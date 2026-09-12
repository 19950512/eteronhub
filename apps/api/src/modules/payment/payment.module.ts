import { Module } from "@nestjs/common";
import { CreditModule } from "../credit/credit.module";
import { ConfirmPaymentUseCase } from "./application/use-cases/confirm-payment.use-case";
import { CreatePixChargeUseCase } from "./application/use-cases/create-pix-charge.use-case";
import { ExpirePendingPaymentsUseCase } from "./application/use-cases/expire-pending-payments.use-case";
import { GetPaymentStatusUseCase } from "./application/use-cases/get-payment-status.use-case";
import { ListActiveCreditPackagesUseCase } from "./application/use-cases/list-active-credit-packages.use-case";
import { ReconcilePaymentsUseCase } from "./application/use-cases/reconcile-payments.use-case";
import { CreditPackageController } from "./credit-package.controller";
import { ExpirePendingPaymentsJob } from "./infra/jobs/expire-pending-payments.job";
import { ReconcilePaymentsJob } from "./infra/jobs/reconcile-payments.job";
import { PrismaCreditPackageRepository } from "./infra/persistence/prisma-credit-package.repository";
import { PrismaPaymentRepository } from "./infra/persistence/prisma-payment.repository";
import { BancoInterAuthService } from "./infra/pix/banco-inter-auth.service";
import { BancoInterPixGateway } from "./infra/pix/banco-inter-pix.gateway";
import { PaymentWebhookController } from "./payment-webhook.controller";
import { PaymentController } from "./payment.controller";
import { CREDIT_PACKAGE_REPOSITORY, PAYMENT_REPOSITORY, PIX_PAYMENT_GATEWAY } from "./payment.tokens";

@Module({
  imports: [CreditModule],
  controllers: [PaymentController, PaymentWebhookController, CreditPackageController],
  providers: [
    { provide: PAYMENT_REPOSITORY, useClass: PrismaPaymentRepository },
    { provide: CREDIT_PACKAGE_REPOSITORY, useClass: PrismaCreditPackageRepository },
    { provide: PIX_PAYMENT_GATEWAY, useClass: BancoInterPixGateway },
    BancoInterAuthService,
    CreatePixChargeUseCase,
    ConfirmPaymentUseCase,
    GetPaymentStatusUseCase,
    ListActiveCreditPackagesUseCase,
    ExpirePendingPaymentsUseCase,
    ReconcilePaymentsUseCase,
    ExpirePendingPaymentsJob,
    ReconcilePaymentsJob,
  ],
})
export class PaymentModule {}
