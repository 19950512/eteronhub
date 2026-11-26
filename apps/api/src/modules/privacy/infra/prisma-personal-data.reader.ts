import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../../infra/prisma/prisma.service";
import { ConsentSubjectRole } from "../../../shared-kernel/application/consent-log.port";
import {
  PersonalDataReader,
  PersonalDataSnapshot,
} from "../application/ports/personal-data-reader.port";

// why: leitura que atravessa vários agregados só para montar o arquivo do
// titular — consulta direta, como o PrismaAccountStatusReader, em vez de
// expor um método de "dump" em cada repositório.
@Injectable()
export class PrismaPersonalDataReader implements PersonalDataReader {
  constructor(private readonly prisma: PrismaService) {}

  async read(
    role: ConsentSubjectRole,
    subjectId: string,
  ): Promise<PersonalDataSnapshot | null> {
    return role === "WORKER" ? this.readWorker(subjectId) : this.readCompany(subjectId);
  }

  private async readWorker(workerId: string): Promise<PersonalDataSnapshot | null> {
    const worker = await this.prisma.worker.findUnique({
      where: { id: workerId },
      select: {
        id: true,
        nome: true,
        cpf: true,
        email: true,
        phone: true,
        bio: true,
        segments: true,
        softwares: true,
        status: true,
        createdAt: true,
        deletedAt: true,
      },
    });
    if (!worker) return null;

    const [consents, wallet, payments, unlocks] = await Promise.all([
      this.consents("WORKER", workerId),
      this.prisma.creditWallet.findUnique({
        where: { workerId },
        select: { id: true, balance: true, updatedAt: true },
      }),
      this.prisma.payment.findMany({
        where: { workerId },
        orderBy: { createdAt: "asc" },
        select: {
          id: true,
          amountCents: true,
          creditsAmount: true,
          status: true,
          pixTxId: true,
          createdAt: true,
          expiresAt: true,
          confirmedAt: true,
        },
      }),
      this.prisma.jobUnlock.findMany({
        where: { workerId },
        orderBy: { unlockedAt: "asc" },
        select: { jobPostingId: true, creditsSpent: true, unlockedAt: true },
      }),
    ]);

    const [transactions, unlockedJobs] = await Promise.all([
      wallet
        ? this.prisma.creditTransaction.findMany({
            where: { walletId: wallet.id },
            orderBy: { createdAt: "asc" },
            select: { type: true, amount: true, createdAt: true },
          })
        : Promise.resolve([]),
      this.prisma.jobPosting.findMany({
        where: { id: { in: unlocks.map((unlock) => unlock.jobPostingId) } },
        select: { id: true, title: true, location: true },
      }),
    ]);
    const jobsById = new Map(unlockedJobs.map((job) => [job.id, job]));

    return {
      cadastro: worker,
      consentimentos: consents,
      carteiraDeCreditos: wallet
        ? { saldo: wallet.balance, atualizadaEm: wallet.updatedAt }
        : null,
      movimentacoesDeCredito: transactions,
      pagamentosPix: payments,
      vagasDesbloqueadas: unlocks.map((unlock) => ({
        ...unlock,
        vaga: jobsById.get(unlock.jobPostingId) ?? null,
      })),
    };
  }

  private async readCompany(companyId: string): Promise<PersonalDataSnapshot | null> {
    const company = await this.prisma.company.findUnique({
      where: { id: companyId },
      select: {
        id: true,
        cnpj: true,
        razaoSocial: true,
        nomeFantasia: true,
        email: true,
        sector: true,
        city: true,
        state: true,
        whatsapp: true,
        website: true,
        status: true,
        createdAt: true,
        deletedAt: true,
      },
    });
    if (!company) return null;

    const [consents, jobPostings] = await Promise.all([
      this.consents("COMPANY", companyId),
      this.prisma.jobPosting.findMany({
        where: { companyId },
        orderBy: { createdAt: "asc" },
        select: {
          id: true,
          title: true,
          description: true,
          requirements: true,
          salaryMinCents: true,
          salaryMaxCents: true,
          location: true,
          contactEmail: true,
          contactPhone: true,
          contactUrl: true,
          unlockCost: true,
          status: true,
          rejectionReason: true,
          publishedAt: true,
          expiresAt: true,
          createdAt: true,
        },
      }),
    ]);

    // why: adminId fica de fora — identifica outra pessoa (o moderador).
    const decisions = await this.prisma.moderationDecision.findMany({
      where: { jobPostingId: { in: jobPostings.map((job) => job.id) } },
      orderBy: { decidedAt: "asc" },
      select: { jobPostingId: true, decision: true, reason: true, decidedAt: true },
    });

    return {
      cadastro: company,
      consentimentos: consents,
      vagas: jobPostings,
      decisoesDeModeracao: decisions,
    };
  }

  private consents(role: ConsentSubjectRole, subjectId: string): Promise<unknown[]> {
    return this.prisma.consentRecord.findMany({
      where: { subjectRole: role, subjectId },
      orderBy: { createdAt: "asc" },
      select: {
        termsVersion: true,
        privacyVersion: true,
        ageConfirmed: true,
        ipAddress: true,
        userAgent: true,
        createdAt: true,
      },
    });
  }
}
