import { Inject, Injectable, Logger } from "@nestjs/common";
import { PAYMENT_REPOSITORY } from "../../payment.tokens";
import { ConfirmPaymentUseCase } from "./confirm-payment.use-case";
import { PaymentRepository } from "../ports/payment-repository.port";

const RECONCILIATION_THRESHOLD_MINUTES = 5;
// why: o PSP não aceita pagamento depois do vencimento, então só a defasagem
// de status logo após a expiração precisa ser coberta — 1h basta e mantém
// pequeno o número de consultas ao Inter por rodada.
const RECENTLY_EXPIRED_WINDOW_MINUTES = 60;

// Cobre o caso de um webhook do Banco Inter perdido: para pagamentos que
// seguem PENDING além do esperado, consulta a cobrança diretamente na API do
// Inter e confirma se ela já foi concluída — ver docs/03-arquitetura-tecnica.md,
// seção 4.4.
@Injectable()
export class ReconcilePaymentsUseCase {
  private readonly logger = new Logger(ReconcilePaymentsUseCase.name);

  constructor(
    @Inject(PAYMENT_REPOSITORY) private readonly paymentRepository: PaymentRepository,
    private readonly confirmPaymentUseCase: ConfirmPaymentUseCase,
  ) {}

  async execute(now: Date = new Date()): Promise<void> {
    const threshold = new Date(
      now.getTime() - RECONCILIATION_THRESHOLD_MINUTES * 60 * 1000,
    );
    const pending = await this.paymentRepository.findPendingOlderThan(threshold);
    // hazard: entre o job de expiração ouvir "não pago" do PSP e gravar
    // EXPIRED, o Pix pode ser concluído; se o webhook também se perder, só
    // esta reverificação das expirações recentes evita dinheiro sem crédito.
    const recentlyExpired = await this.paymentRepository.findExpiredSince(
      new Date(now.getTime() - RECENTLY_EXPIRED_WINDOW_MINUTES * 60 * 1000),
    );
    const candidates = [...pending, ...recentlyExpired];

    if (candidates.length > 0) {
      this.logger.log(
        `Reconciliando ${pending.length} pagamento(s) pendente(s) há mais de ${RECONCILIATION_THRESHOLD_MINUTES} minutos e ${recentlyExpired.length} expirado(s) recentemente`,
      );
    }

    for (const payment of candidates) {
      // why: uma falha isolada (timeout do Inter, cobrança com dado inesperado)
      // não pode impedir a reconciliação dos demais pagamentos.
      try {
        const outcome = await this.confirmPaymentUseCase.execute({
          pixTxId: payment.pixTxId,
        });
        if (outcome === "CONFIRMED") {
          this.logger.warn(
            `Pagamento ${payment.id} estava CONCLUIDA no Banco Inter mas não confirmado localmente — webhook provavelmente perdido`,
          );
        }
      } catch (error) {
        this.logger.error(
          `Falha ao reconciliar o pagamento ${payment.id}`,
          error as Error,
        );
      }
    }
  }
}
