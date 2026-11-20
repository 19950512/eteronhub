import { Global, Module } from "@nestjs/common";
import { JobLeaseService } from "../scheduling/job-lease.service";
import { PrismaUnitOfWork } from "./prisma-unit-of-work";
import { PrismaService } from "./prisma.service";

@Global()
@Module({
  providers: [PrismaService, PrismaUnitOfWork, JobLeaseService],
  exports: [PrismaService, PrismaUnitOfWork, JobLeaseService],
})
export class PrismaModule {}
