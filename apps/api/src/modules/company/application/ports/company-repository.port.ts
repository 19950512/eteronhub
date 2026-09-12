import { Cnpj } from "../../../../shared-kernel/domain/cnpj.vo";
import { Email } from "../../../../shared-kernel/domain/email.vo";
import { Company } from "../../domain/company.entity";

export interface CompanyRepository {
  save(company: Company): Promise<void>;
  findById(id: string): Promise<Company | null>;
  findByCnpj(cnpj: Cnpj): Promise<Company | null>;
  findByEmail(email: Email): Promise<Company | null>;
  existsByCnpj(cnpj: Cnpj): Promise<boolean>;
  existsByEmail(email: Email): Promise<boolean>;
}
