import { Inject, Injectable } from "@nestjs/common";
import { ConsentSubjectRole } from "../../../../shared-kernel/application/consent-log.port";
import {
  PRIVACY_POLICY_VERSION,
  TERMS_OF_USE_VERSION,
} from "../../../../shared-kernel/domain/legal-consent.vo";
import { PERSONAL_DATA_READER } from "../../privacy.tokens";
import { AccountNotFoundError } from "../errors";
import {
  PersonalDataReader,
  PersonalDataSnapshot,
} from "../ports/personal-data-reader.port";

export interface PersonalDataExport {
  geradoEm: string;
  titular: { tipo: ConsentSubjectRole; id: string };
  versoesVigentes: { termosDeUso: string; politicaDePrivacidade: string };
  dados: PersonalDataSnapshot;
}

@Injectable()
export class ExportPersonalDataUseCase {
  constructor(
    @Inject(PERSONAL_DATA_READER) private readonly reader: PersonalDataReader,
  ) {}

  async execute(
    role: ConsentSubjectRole,
    subjectId: string,
    now = new Date(),
  ): Promise<PersonalDataExport> {
    const dados = await this.reader.read(role, subjectId);
    if (!dados) {
      throw new AccountNotFoundError();
    }
    return {
      geradoEm: now.toISOString(),
      titular: { tipo: role, id: subjectId },
      versoesVigentes: {
        termosDeUso: TERMS_OF_USE_VERSION,
        politicaDePrivacidade: PRIVACY_POLICY_VERSION,
      },
      dados,
    };
  }
}
