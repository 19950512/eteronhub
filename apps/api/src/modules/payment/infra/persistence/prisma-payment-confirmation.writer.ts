import { randomUUID } from "node:crypto";
import { Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../../../../infra/prisma/prisma.service";
import {
  ConfirmAndCreditInput,
  PaymentConfirmationWriter,
} from "../../application/ports/payment-confirmation-writer.port";

@Injectable()
export class PrismaPaymentConfirmationWriter implements PaymentConfirmationWriter {
  constructor(private readonly prisma: PrismaService) {}

  async confirmAndCredit(input: ConfirmAndCreditInput): Promise<boolean> {
    try {
      return await this.prisma.$transaction(async (tx) => {
        // invariant: o UPDATE condicional trava a linha do pagamento; uma
        // transação concorrente reavalia o WHERE depois do commit desta, vê
        // CONFIRMED e não credita de novo.
        const { count } = await tx.payment.updateMany({
          where: { id: input.paymentId, status: { in: ["PENDING", "EXPIRED"] } },
          data: {
            status: "CONFIRMED",
            pixE2eId: input.e2eId,
            confirmedAt: input.confirmedAt,
          },
        });
        if (count === 0) {
          return false;
        }

        // why: increment atômico no banco — ler o saldo e gravar o valor final
        // perderia créditos se um desbloqueio debitasse a carteira ao mesmo tempo.
        const wallet = await tx.creditWallet.upsert({
          where: { workerId: input.workerId },
          create: {
            id: randomUUID(),
            workerId: input.workerId,
            balance: input.creditsAmount.value,
          },
          update: { balance: { increment: input.creditsAmount.value } },
        });

        await tx.creditTransaction.create({
          data: {
            id: randomUUID(),
            walletId: wallet.id,
            type: "TOPUP",
            amount: input.creditsAmount.value,
            relatedPaymentId: input.paymentId,
          },
        });

        return true;
      });
    } catch (error) {
      // invariant: a constraint única em CreditTransaction.relatedPaymentId
      // garante no máximo um crédito por pagamento; a violação desfaz a
      // transação inteira e significa que outra confirmação já creditou.
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        // hazard: P2002 também pode vir da criação concorrente da carteira —
        // aí nada foi confirmado; só é "já creditado" se o pagamento está CONFIRMED.
        const current = await this.prisma.payment.findUnique({
          where: { id: input.paymentId },
          select: { status: true },
        });
        if (current?.status === "CONFIRMED") {
          return false;
        }
      }
      throw error;
    }
  }
}
