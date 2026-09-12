import { CreditAmount } from "../../../shared-kernel/domain/credit-amount.vo";
import { ContactInfo } from "./contact-info.vo";
import { InvalidJobPostingStateError, JobPosting, MissingRejectionReasonError } from "./job-posting.entity";
import { SalaryRange } from "./salary-range.vo";

function createDraft(): JobPosting {
  return JobPosting.create({
    companyId: "company-1",
    title: "Desenvolvedor Backend",
    description: "Descrição da vaga",
    requirements: "Node.js, TypeScript",
    salaryRange: SalaryRange.create(300000, 500000),
    location: "São Paulo, SP",
    contactInfo: ContactInfo.create({ email: "vagas@empresa.com" }),
    unlockCost: CreditAmount.of(10),
  });
}

describe("JobPosting", () => {
  it("começa em DRAFT e não expõe dados da empresa na visão pública", () => {
    const jobPosting = createDraft();
    expect(jobPosting.status).toBe("DRAFT");
    expect(jobPosting.toPublicView()).not.toHaveProperty("companyId");
    expect(jobPosting.toPublicView()).not.toHaveProperty("contactInfo");
  });

  it("percorre o ciclo DRAFT -> IN_MODERATION -> PUBLISHED", () => {
    const jobPosting = createDraft();
    jobPosting.submitForModeration();
    expect(jobPosting.status).toBe("IN_MODERATION");

    const publishedAt = new Date("2026-01-01T00:00:00Z");
    const expiresAt = new Date("2026-01-31T00:00:00Z");
    jobPosting.approve(publishedAt, expiresAt);

    expect(jobPosting.status).toBe("PUBLISHED");
    expect(jobPosting.toInternalView().publishedAt).toEqual(publishedAt);
    expect(jobPosting.expiresAt).toEqual(expiresAt);
  });

  it("permite rejeitar com motivo e depois resubmeter para moderação (regras 7 e 8)", () => {
    const jobPosting = createDraft();
    jobPosting.submitForModeration();
    jobPosting.reject("Descrição incompleta");

    expect(jobPosting.status).toBe("REJECTED");
    expect(jobPosting.toInternalView().rejectionReason).toBe("Descrição incompleta");

    jobPosting.submitForModeration();
    expect(jobPosting.status).toBe("IN_MODERATION");
    expect(jobPosting.toInternalView().rejectionReason).toBeNull();
  });

  it("exige um motivo não vazio para rejeitar", () => {
    const jobPosting = createDraft();
    jobPosting.submitForModeration();
    expect(() => jobPosting.reject("   ")).toThrow(MissingRejectionReasonError);
  });

  it("permite encerrar uma vaga publicada e ela some do catálogo, mas fica CLOSED (regra 22)", () => {
    const jobPosting = createDraft();
    jobPosting.submitForModeration();
    jobPosting.approve(new Date(), new Date(Date.now() + 1000));
    jobPosting.close();
    expect(jobPosting.status).toBe("CLOSED");
  });

  it("expira apenas depois da data de expiração (regra 21)", () => {
    const jobPosting = createDraft();
    jobPosting.submitForModeration();
    const expiresAt = new Date(Date.now() + 1000);
    jobPosting.approve(new Date(), expiresAt);

    expect(() => jobPosting.expire(new Date(expiresAt.getTime() - 1))).toThrow(InvalidJobPostingStateError);

    jobPosting.expire(new Date(expiresAt.getTime() + 1));
    expect(jobPosting.status).toBe("EXPIRED");
  });

  it("rejeita transições inválidas", () => {
    const jobPosting = createDraft();
    expect(() => jobPosting.approve(new Date(), new Date())).toThrow(InvalidJobPostingStateError);
    expect(() => jobPosting.close()).toThrow(InvalidJobPostingStateError);
  });

  it("só permite editar o rascunho enquanto está em DRAFT", () => {
    const jobPosting = createDraft();
    jobPosting.submitForModeration();

    expect(() =>
      jobPosting.updateDraft({
        title: "Outro título",
        description: "Outra descrição",
        requirements: "Outros requisitos",
        salaryRange: SalaryRange.create(400000, 600000),
        location: "Rio de Janeiro, RJ",
        contactInfo: ContactInfo.create({ email: "outro@empresa.com" }),
        unlockCost: CreditAmount.of(20),
      }),
    ).toThrow(InvalidJobPostingStateError);
  });
});
