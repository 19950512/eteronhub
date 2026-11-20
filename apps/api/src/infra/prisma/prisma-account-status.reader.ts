import { Injectable } from "@nestjs/common";
import { AccountStatusReader } from "../../shared-kernel/application/account-status-reader.port";
import { Role } from "../../shared-kernel/application/auth-token-service.port";
import { PrismaService } from "./prisma.service";

@Injectable()
export class PrismaAccountStatusReader implements AccountStatusReader {
  constructor(private readonly prisma: PrismaService) {}

  async isActive(role: Role, subject: string): Promise<boolean> {
    if (role === "COMPANY") {
      const company = await this.prisma.company.findUnique({
        where: { id: subject },
        select: { status: true },
      });
      return company?.status === "ACTIVE";
    }
    if (role === "WORKER") {
      const worker = await this.prisma.worker.findUnique({
        where: { id: subject },
        select: { status: true },
      });
      return worker?.status === "ACTIVE";
    }
    const admin = await this.prisma.admin.findUnique({
      where: { id: subject },
      select: { id: true },
    });
    return admin !== null;
  }
}
