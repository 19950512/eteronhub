import { Inject, Injectable, Logger } from "@nestjs/common";
import { PasswordHasher } from "../../../../shared-kernel/application/password-hasher.port";
import { PASSWORD_HASHER } from "../../../../shared-kernel/tokens";
import { CompanyRepository } from "../../../company/application/ports/company-repository.port";
import { COMPANY_REPOSITORY } from "../../../company/company.tokens";
import { JobPostingRepository } from "../../../job-posting/application/ports/job-posting-repository.port";
import { JOB_POSTING_REPOSITORY } from "../../../job-posting/job-posting.tokens";
import { AccountNotFoundError, DeletionPasswordMismatchError } from "../errors";

@Injectable()
export class DeleteCompanyAccountUseCase {
  private readonly logger = new Logger(DeleteCompanyAccountUseCase.name);

  constructor(
    @Inject(COMPANY_REPOSITORY) private readonly companyRepository: CompanyRepository,
    @Inject(JOB_POSTING_REPOSITORY)
    private readonly jobPostingRepository: JobPostingRepository,
    @Inject(PASSWORD_HASHER) private readonly passwordHasher: PasswordHasher,
  ) {}

  async execute(companyId: string, password: string, now = new Date()): Promise<void> {
    const company = await this.companyRepository.findById(companyId);
    if (!company) {
      throw new AccountNotFoundError();
    }
    if (!(await this.passwordHasher.compare(password, company.passwordHash))) {
      throw new DeletionPasswordMismatchError();
    }

    // hazard: sem transação entre os repositórios. As vagas saem do ar antes de
    // a conta ser anonimizada: se o segundo passo falhar, a empresa continua com
    // acesso e pode tentar de novo — o contrário deixaria vaga publicada de uma
    // conta já excluída.
    const jobPostings = await this.jobPostingRepository.findByCompany(companyId);
    let withdrawn = 0;
    for (const jobPosting of jobPostings) {
      if (jobPosting.withdrawForCompanyDeletion()) {
        await this.jobPostingRepository.save(jobPosting);
        withdrawn += 1;
      }
    }

    company.deleteAccount(now);
    await this.companyRepository.save(company);

    this.logger.log(
      `Conta de empresa ${companyId} excluída a pedido do titular; ${withdrawn} vaga(s) encerrada(s)`,
    );
  }
}
