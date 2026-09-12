import { Injectable } from "@nestjs/common";
import type { JobPosting as JobPostingRecord } from "@prisma/client";
import { PrismaService } from "../../../../infra/prisma/prisma.service";
import { CreditAmount } from "../../../../shared-kernel/domain/credit-amount.vo";
import { ContactInfo } from "../../domain/contact-info.vo";
import { JobPosting, JobPostingStatus } from "../../domain/job-posting.entity";
import { SalaryRange } from "../../domain/salary-range.vo";
import { JobPostingFilter, JobPostingRepository } from "../../application/ports/job-posting-repository.port";

@Injectable()
export class PrismaJobPostingRepository implements JobPostingRepository {
  constructor(private readonly prisma: PrismaService) {}

  async save(jobPosting: JobPosting): Promise<void> {
    const view = jobPosting.toInternalView();

    await this.prisma.jobPosting.upsert({
      where: { id: jobPosting.id },
      create: {
        id: jobPosting.id,
        companyId: view.companyId,
        title: view.title,
        description: view.description,
        requirements: view.requirements,
        salaryMinCents: view.salaryRangeCents.min,
        salaryMaxCents: view.salaryRangeCents.max,
        location: view.location,
        contactEmail: view.contactInfo.email,
        contactPhone: view.contactInfo.phone,
        contactUrl: view.contactInfo.applicationUrl,
        unlockCost: view.unlockCost,
        status: view.status,
        rejectionReason: view.rejectionReason,
        publishedAt: view.publishedAt,
        expiresAt: view.expiresAt,
        createdAt: view.createdAt,
      },
      update: {
        title: view.title,
        description: view.description,
        requirements: view.requirements,
        salaryMinCents: view.salaryRangeCents.min,
        salaryMaxCents: view.salaryRangeCents.max,
        location: view.location,
        contactEmail: view.contactInfo.email,
        contactPhone: view.contactInfo.phone,
        contactUrl: view.contactInfo.applicationUrl,
        unlockCost: view.unlockCost,
        status: view.status,
        rejectionReason: view.rejectionReason,
        publishedAt: view.publishedAt,
        expiresAt: view.expiresAt,
      },
    });
  }

  async findById(id: string): Promise<JobPosting | null> {
    const record = await this.prisma.jobPosting.findUnique({ where: { id } });
    return record ? this.toDomain(record) : null;
  }

  async findByCompany(companyId: string): Promise<JobPosting[]> {
    const records = await this.prisma.jobPosting.findMany({
      where: { companyId },
      orderBy: { createdAt: "desc" },
    });
    return records.map((record) => this.toDomain(record));
  }

  async findPublished(filter?: JobPostingFilter): Promise<JobPosting[]> {
    const records = await this.prisma.jobPosting.findMany({
      where: {
        status: "PUBLISHED",
        ...(filter?.location ? { location: { contains: filter.location, mode: "insensitive" } } : {}),
      },
      orderBy: { publishedAt: "desc" },
    });
    return records.map((record) => this.toDomain(record));
  }

  async findPendingModeration(): Promise<JobPosting[]> {
    const records = await this.prisma.jobPosting.findMany({
      where: { status: "IN_MODERATION" },
      orderBy: { createdAt: "asc" },
    });
    return records.map((record) => this.toDomain(record));
  }

  async findExpiredPublished(now: Date): Promise<JobPosting[]> {
    const records = await this.prisma.jobPosting.findMany({
      where: { status: "PUBLISHED", expiresAt: { lte: now } },
    });
    return records.map((record) => this.toDomain(record));
  }

  private toDomain(record: JobPostingRecord): JobPosting {
    return JobPosting.restore({
      id: record.id,
      companyId: record.companyId,
      title: record.title,
      description: record.description,
      requirements: record.requirements,
      salaryRange: SalaryRange.create(record.salaryMinCents, record.salaryMaxCents),
      location: record.location,
      contactInfo: ContactInfo.create({
        email: record.contactEmail,
        phone: record.contactPhone,
        applicationUrl: record.contactUrl,
      }),
      unlockCost: CreditAmount.of(record.unlockCost),
      status: record.status as JobPostingStatus,
      rejectionReason: record.rejectionReason,
      publishedAt: record.publishedAt,
      expiresAt: record.expiresAt,
      createdAt: record.createdAt,
    });
  }
}
