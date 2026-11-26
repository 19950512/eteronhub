import { Injectable } from "@nestjs/common";
import {
  ConsentEntry,
  ConsentLog,
} from "../../shared-kernel/application/consent-log.port";
import { PrismaService } from "./prisma.service";

const USER_AGENT_MAX_LENGTH = 500;

@Injectable()
export class PrismaConsentLog implements ConsentLog {
  constructor(private readonly prisma: PrismaService) {}

  async append(entry: ConsentEntry): Promise<void> {
    await this.prisma.consentRecord.create({
      data: {
        subjectRole: entry.subjectRole,
        subjectId: entry.subjectId,
        termsVersion: entry.consent.termsVersion,
        privacyVersion: entry.consent.privacyVersion,
        ageConfirmed: entry.consent.ageConfirmed,
        ipAddress: entry.context.ipAddress,
        userAgent: entry.context.userAgent?.slice(0, USER_AGENT_MAX_LENGTH) ?? null,
      },
    });
  }
}
