import { ConsentSubjectRole } from "../../../../shared-kernel/application/consent-log.port";

/**
 * Tudo o que a plataforma guarda sobre o titular, já sem segredos (hash de
 * senha) e sem dados de terceiros (ids de admin). Estrutura livre: vira o
 * arquivo JSON entregue no pedido de acesso/portabilidade (LGPD art. 18, II e V).
 */
export type PersonalDataSnapshot = Record<string, unknown>;

export interface PersonalDataReader {
  read(role: ConsentSubjectRole, subjectId: string): Promise<PersonalDataSnapshot | null>;
}
