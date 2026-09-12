import { Email } from "../../../../shared-kernel/domain/email.vo";
import { Admin } from "../../domain/admin.entity";

export interface AdminRepository {
  findById(id: string): Promise<Admin | null>;
  findByEmail(email: Email): Promise<Admin | null>;
}
